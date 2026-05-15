import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { GitHistoryProvider, GitCommit } from './gitHistoryProvider';
import { I18n } from './i18n';

const execAsync = promisify(exec);

export interface ConfirmationUi {
    showInputBox: typeof vscode.window.showInputBox;
    showWarningMessage: typeof vscode.window.showWarningMessage;
    showInformationMessage: typeof vscode.window.showInformationMessage;
    showErrorMessage: typeof vscode.window.showErrorMessage;
}

const defaultUi: ConfirmationUi = {
    showInputBox: vscode.window.showInputBox.bind(vscode.window),
    showWarningMessage: vscode.window.showWarningMessage.bind(vscode.window) as ConfirmationUi['showWarningMessage'],
    showInformationMessage: vscode.window.showInformationMessage.bind(vscode.window) as ConfirmationUi['showInformationMessage'],
    showErrorMessage: vscode.window.showErrorMessage.bind(vscode.window) as ConfirmationUi['showErrorMessage'],
};

async function resolveActiveRepoRoot(): Promise<string | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const editorFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        const probeDir = path.dirname(editor.document.fileName);
        const probe = fs.existsSync(probeDir) ? probeDir : editorFolder?.uri.fsPath;
        if (probe) {
            try {
                const { stdout } = await execAsync('git rev-parse --show-toplevel', { cwd: probe });
                const root = stdout.trim();
                if (root) {
                    return root;
                }
            } catch {
                // fall through to workspace probing
            }
        }
    }

    const folders = vscode.workspace.workspaceFolders ?? [];
    for (const folder of folders) {
        try {
            const { stdout } = await execAsync('git rev-parse --show-toplevel', {
                cwd: folder.uri.fsPath,
            });
            const root = stdout.trim();
            if (root) {
                return root;
            }
        } catch {
            continue;
        }
    }
    return undefined;
}

/**
 * 显示行修改历史命令
 */
export async function showLineHistory(
    gitHistoryProvider: GitHistoryProvider
): Promise<{ filePath: string; lineNumber: number } | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage(I18n.t('noActiveEditor'));
        return;
    }

    const selection = editor.selection;
    const lineNumber = selection.active.line + 1; // VSCode行号从0开始，git从1开始
    const filePath = editor.document.fileName;

    // 检查文件是否在Git仓库中
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
    if (!workspaceFolder) {
        vscode.window.showWarningMessage(I18n.t('fileNotInWorkspace'));
        return;
    }

    // 获取当前行的内容用于显示
    const currentLine = editor.document.lineAt(selection.active.line);
    const lineContent = currentLine.text.trim();
    const displayContent =
        lineContent.length > 50 ? lineContent.substring(0, 50) + '...' : lineContent;

    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: I18n.t('loadingHistory'),
            cancellable: false,
        },
        async () => {
            const commits = await gitHistoryProvider.getLineHistory(filePath, lineNumber);

            if (commits.length === 0) {
                const message = I18n.isChinese() 
                    ? `第${lineNumber}行未找到修改历史${displayContent ? `: "${displayContent}"` : ''}`
                    : `No history found for line ${lineNumber}${displayContent ? `: "${displayContent}"` : ''}`;
                vscode.window.showInformationMessage(message);
                return;
            }

            // 显示成功消息
            const message = I18n.isChinese()
                ? `找到第${lineNumber}行的${commits.length}个修改记录${displayContent ? `: "${displayContent}"` : ''}`
                : `Found ${commits.length} commits for line ${lineNumber}${displayContent ? `: "${displayContent}"` : ''}`;
            vscode.window.showInformationMessage(message);

            // 显示Git Liner活动栏
            await vscode.commands.executeCommand('gitLiner.focus');

            // 返回信息给侧边栏
            return { filePath, lineNumber };
        }
    );
}

/**
 * 显示文件修改历史命令
 */
export async function showFileHistory(
    gitHistoryProvider: GitHistoryProvider
): Promise<{ filePath: string } | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage(I18n.t('noActiveEditor'));
        return;
    }

    const filePath = editor.document.fileName;
    const fileName = vscode.workspace.asRelativePath(filePath);

    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: I18n.t('loadingHistory'),
            cancellable: false,
        },
        async () => {
            const commits = await gitHistoryProvider.getFileHistory(filePath);

            if (commits.length === 0) {
                vscode.window.showInformationMessage(I18n.t('noHistoryFound'));
                return;
            }

            // 显示Git Liner活动栏
            await vscode.commands.executeCommand('gitLiner.focus');

            // 返回信息给侧边栏
            return { filePath };
        }
    );
}

/**
 * 显示项目历史命令：定位仓库根并返回给侧边栏使用
 */
export async function showProjectHistory(
    _gitHistoryProvider: GitHistoryProvider
): Promise<{ repoRoot: string } | undefined> {
    const repoRoot = await resolveActiveRepoRoot();
    if (!repoRoot) {
        vscode.window.showWarningMessage(I18n.t('noGitRepository'));
        return;
    }

    await vscode.commands.executeCommand('gitLiner.focus');
    return { repoRoot };
}

export async function amendLatestCommitMessage(
    gitHistoryProvider: GitHistoryProvider,
    ui: ConfirmationUi = defaultUi
): Promise<{ repoRoot: string } | undefined> {
    const repoRoot = await resolveActiveRepoRoot();
    if (!repoRoot) {
        ui.showWarningMessage(I18n.t('noGitRepository'));
        return;
    }

    let currentSubject = '';
    try {
        const { stdout } = await execAsync('git log -1 --pretty=%B', { cwd: repoRoot });
        currentSubject = stdout.trimEnd();
    } catch {
        currentSubject = '';
    }

    const newMessage = await ui.showInputBox({
        value: currentSubject,
        prompt: I18n.t('amend.prompt'),
        validateInput: (value) => (value && value.trim().length > 0 ? null : I18n.t('amend.empty')),
    });

    if (!newMessage || !newMessage.trim()) {
        return;
    }

    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: I18n.t('amend.prompt'),
            cancellable: false,
        },
        async () => {
            try {
                await gitHistoryProvider.amendCommitMessage(repoRoot, newMessage);
                ui.showInformationMessage(I18n.t('amend.success'));
                return { repoRoot };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (/staged|index/i.test(message)) {
                    ui.showErrorMessage(I18n.t('amend.staged'));
                } else {
                    ui.showErrorMessage(message);
                }
                return undefined;
            }
        }
    );
}

export async function softResetLatestToUpstream(
    gitHistoryProvider: GitHistoryProvider,
    ui: ConfirmationUi = defaultUi
): Promise<{ repoRoot: string } | undefined> {
    const repoRoot = await resolveActiveRepoRoot();
    if (!repoRoot) {
        ui.showWarningMessage(I18n.t('noGitRepository'));
        return;
    }

    const status = await gitHistoryProvider.getUpstreamStatus(repoRoot);
    if (!status.upstream) {
        ui.showWarningMessage(I18n.t('error.noUpstream'));
        return;
    }
    if (status.aheadHashes.length === 0) {
        ui.showWarningMessage(I18n.t('error.notUnpushedHead'));
        return;
    }

    const confirmLabel = I18n.t('softReset.confirmAction');
    const confirmation = await ui.showWarningMessage(
        I18n.t('softReset.confirm', status.upstream, status.aheadHashes.length),
        { modal: true },
        confirmLabel
    );
    if (confirmation !== confirmLabel) {
        return;
    }

    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: I18n.t('softReset.confirmAction'),
            cancellable: false,
        },
        async () => {
            try {
                await gitHistoryProvider.softResetToUpstream(repoRoot);
                ui.showInformationMessage(I18n.t('softReset.success', status.upstream));
                return { repoRoot };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                ui.showErrorMessage(message);
                return undefined;
            }
        }
    );
}
