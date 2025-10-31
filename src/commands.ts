import * as vscode from 'vscode';
import { GitHistoryProvider, GitCommit } from './gitHistoryProvider';

/**
 * 显示行修改历史命令
 */
export async function showLineHistory(gitHistoryProvider: GitHistoryProvider): Promise<{filePath: string, lineNumber: number} | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('请先打开一个文件');
        return;
    }

    const selection = editor.selection;
    const lineNumber = selection.active.line + 1; // VSCode行号从0开始，git从1开始
    const filePath = editor.document.fileName;

    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "正在获取行修改历史...",
        cancellable: false
    }, async () => {
        const commits = await gitHistoryProvider.getLineHistory(filePath, lineNumber);
        
        if (commits.length === 0) {
            vscode.window.showInformationMessage('未找到该行的修改历史');
            return;
        }

        // 显示快速选择（保持原有功能）
        showCommitQuickPick(commits, gitHistoryProvider, filePath, `第 ${lineNumber} 行的修改历史`);
        
        // 返回信息给侧边栏
        return { filePath, lineNumber };
    });
}

/**
 * 显示文件修改历史命令
 */
export async function showFileHistory(gitHistoryProvider: GitHistoryProvider): Promise<{filePath: string} | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('请先打开一个文件');
        return;
    }

    const filePath = editor.document.fileName;
    const fileName = vscode.workspace.asRelativePath(filePath);

    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "正在获取文件修改历史...",
        cancellable: false
    }, async () => {
        const commits = await gitHistoryProvider.getFileHistory(filePath);
        
        if (commits.length === 0) {
            vscode.window.showInformationMessage('未找到文件的修改历史');
            return;
        }

        // 显示快速选择（保持原有功能）
        showCommitQuickPick(commits, gitHistoryProvider, filePath, `${fileName} 的修改历史`);
        
        // 返回信息给侧边栏
        return { filePath };
    });
}

/**
 * 显示提交选择列表
 */
function showCommitQuickPick(
    commits: GitCommit[], 
    gitHistoryProvider: GitHistoryProvider, 
    filePath: string,
    title: string
): void {
    const items = commits.map(commit => ({
        label: `$(git-commit) ${commit.hash}`,
        description: `${commit.author} • ${commit.date}`,
        detail: commit.message + (commit.changes ? ` • ${commit.changes}` : ''),
        commit
    }));

    const quickPick = vscode.window.createQuickPick();
    quickPick.title = title;
    quickPick.placeholder = '选择一个提交查看详细差异';
    quickPick.items = items;
    quickPick.canSelectMany = false;

    quickPick.onDidChangeSelection(async (selection: readonly vscode.QuickPickItem[]) => {
        if (selection.length > 0) {
            const selectedItem = selection[0] as any;
            quickPick.hide();
            // 使用完整的hash而不是截断的hash
            await gitHistoryProvider.showCommitDiff(filePath, selectedItem.commit.fullHash);
        }
    });

    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
}