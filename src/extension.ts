import * as vscode from 'vscode';
import { GitHistoryProvider } from './gitHistoryProvider';
import {
    showLineHistory,
    showFileHistory,
    showProjectHistory,
    amendLatestCommitMessage,
    softResetLatestToUpstream,
} from './commands';
import {
    LineHistoryTreeProvider,
    FileHistoryTreeProvider,
    ProjectHistoryTreeProvider,
    SmartRefreshManager,
} from './historyTreeProvider';
import { GitHistoryStatusBar } from './statusBar';
import { I18n } from './i18n';

let gitHistoryProvider: GitHistoryProvider;

export function activate(context: vscode.ExtensionContext) {
    // 初始化国际化
    I18n.init(context);
    
    gitHistoryProvider = new GitHistoryProvider();
    const lineHistoryTreeProvider = new LineHistoryTreeProvider(gitHistoryProvider);
    const fileHistoryTreeProvider = new FileHistoryTreeProvider(gitHistoryProvider);
    const projectHistoryTreeProvider = new ProjectHistoryTreeProvider(gitHistoryProvider);
    const statusBar = new GitHistoryStatusBar();

    // 注册侧边栏视图
    const lineTreeView = vscode.window.createTreeView('gitLiner.lineHistoryView', {
        treeDataProvider: lineHistoryTreeProvider,
        showCollapseAll: false,
    });

    const fileTreeView = vscode.window.createTreeView('gitLiner.fileHistoryView', {
        treeDataProvider: fileHistoryTreeProvider,
        showCollapseAll: false,
    });

    const projectTreeView = vscode.window.createTreeView('gitLiner.projectHistoryView', {
        treeDataProvider: projectHistoryTreeProvider,
        showCollapseAll: false,
    });

    // 创建智能刷新管理器
    const smartRefreshManager = new SmartRefreshManager(
        gitHistoryProvider,
        lineHistoryTreeProvider,
        fileHistoryTreeProvider,
        lineTreeView,
        fileTreeView
    );

    // 更新视图标题
    const updateLineViewTitle = () => {
        const info = lineHistoryTreeProvider.getCurrentInfo();
        if (info.filePath && info.lineNumber) {
            const fileName = vscode.workspace.asRelativePath(info.filePath);
            lineTreeView.title = I18n.t('lineHistory.titleWithFile', fileName, info.lineNumber);
        } else {
            lineTreeView.title = I18n.t('lineHistory.title');
        }
    };

    const updateFileViewTitle = () => {
        const info = fileHistoryTreeProvider.getCurrentInfo();
        if (info.filePath) {
            const fileName = vscode.workspace.asRelativePath(info.filePath);
            fileTreeView.title = I18n.t('fileHistory.titleWithFile', fileName);
        } else {
            fileTreeView.title = I18n.t('fileHistory.title');
        }
    };

    const updateProjectViewTitle = () => {
        const repoRoot = projectHistoryTreeProvider.getCurrentRepoRoot();
        if (repoRoot) {
            const folderName = vscode.workspace.asRelativePath(repoRoot) || repoRoot;
            projectTreeView.title = `${I18n.t('projectHistory.title')}: ${folderName}`;
        } else {
            projectTreeView.title = I18n.t('projectHistory.title');
        }
    };

    // 注册命令
    const showLineHistoryCommand = vscode.commands.registerCommand(
        'gitLiner.showLineHistory',
        async () => {
            const result = await showLineHistory(gitHistoryProvider);
            if (result) {
                await lineHistoryTreeProvider.showLineHistory(result.filePath, result.lineNumber);
                updateLineViewTitle();
            }
        }
    );

    const showFileHistoryCommand = vscode.commands.registerCommand(
        'gitLiner.showFileHistory',
        async () => {
            const result = await showFileHistory(gitHistoryProvider);
            if (result) {
                await fileHistoryTreeProvider.showFileHistory(result.filePath);
                updateFileViewTitle();
            }
        }
    );

    const refreshCommand = vscode.commands.registerCommand('gitLiner.refresh', async () => {
        if (projectTreeView.visible) {
            const repoRoot = projectHistoryTreeProvider.getCurrentRepoRoot();
            if (repoRoot) {
                await projectHistoryTreeProvider.showProjectHistory(repoRoot);
                updateProjectViewTitle();
                return;
            }
        }
        await smartRefreshManager.smartRefresh();
        updateLineViewTitle();
        updateFileViewTitle();
    });

    const showProjectHistoryCommand = vscode.commands.registerCommand(
        'gitLiner.showProjectHistory',
        async () => {
            const result = await showProjectHistory(gitHistoryProvider);
            if (result) {
                await projectHistoryTreeProvider.showProjectHistory(result.repoRoot);
                updateProjectViewTitle();
                await vscode.commands.executeCommand('gitLiner.projectHistoryView.focus');
            }
        }
    );

    const loadMoreProjectHistoryCommand = vscode.commands.registerCommand(
        'gitLiner.loadMoreProjectHistory',
        async (repoRoot: string, page: number) => {
            await projectHistoryTreeProvider.loadMoreProjectHistory(repoRoot, page);
            updateProjectViewTitle();
        }
    );

    const amendLatestCommitMessageCommand = vscode.commands.registerCommand(
        'gitLiner.amendLatestCommitMessage',
        async () => {
            const result = await amendLatestCommitMessage(gitHistoryProvider);
            if (result) {
                await projectHistoryTreeProvider.showProjectHistory(result.repoRoot);
                updateProjectViewTitle();
            }
        }
    );

    const softResetLatestToUpstreamCommand = vscode.commands.registerCommand(
        'gitLiner.softResetLatestToUpstream',
        async () => {
            const result = await softResetLatestToUpstream(gitHistoryProvider);
            if (result) {
                await projectHistoryTreeProvider.showProjectHistory(result.repoRoot);
                updateProjectViewTitle();
            }
        }
    );

    const showCommitDiffCommand = vscode.commands.registerCommand(
        'gitLiner.showCommitDiff',
        async (filePath?: string, commitHash?: string) => {
            if (filePath && commitHash) {
                await gitHistoryProvider.showCommitDiff(filePath, commitHash);
            }
        }
    );

    const showLineCommitDiffCommand = vscode.commands.registerCommand(
        'gitLiner.showLineCommitDiff',
        async (filePath?: string, commitHash?: string, lineNumber?: number) => {
            if (filePath && commitHash && lineNumber !== undefined) {
                await gitHistoryProvider.showLineCommitDiff(filePath, commitHash, lineNumber);
            }
        }
    );

    const copyCommitHashCommand = vscode.commands.registerCommand(
        'gitLiner.copyCommitHash',
        async (item: any) => {
            if (item && item.commit) {
                await vscode.env.clipboard.writeText(item.commit.fullHash);
                vscode.window.showInformationMessage(I18n.t('copyCommitHash.success', item.commit.hash));
            }
        }
    );

    const focusCommand = vscode.commands.registerCommand('gitLiner.focus', async () => {
        // 默认聚焦到文件历史视图
        await vscode.commands.executeCommand('gitLiner.fileHistoryView.focus');
    });

    const loadMoreLineHistoryCommand = vscode.commands.registerCommand(
        'gitLiner.loadMoreLineHistory',
        async (filePath: string, lineNumber: number, page: number) => {
            await lineHistoryTreeProvider.loadMoreLineHistory(filePath, lineNumber, page);
            updateLineViewTitle();
        }
    );

    const loadMoreFileHistoryCommand = vscode.commands.registerCommand(
        'gitLiner.loadMoreFileHistory',
        async (filePath: string, _lineNumber: undefined, page: number) => {
            await fileHistoryTreeProvider.loadMoreFileHistory(filePath, page);
            updateFileViewTitle();
        }
    );

    // 监听编辑器变化以更新状态栏和自动刷新项目历史
    let projectRefreshTimer: NodeJS.Timeout | undefined;
    const autoRefreshProjectHistory = async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const filePath = editor.document.fileName;
        if (filePath.startsWith('extension-output') || editor.document.uri.scheme !== 'file') {
            return;
        }
        try {
            const fileDir = require('path').dirname(filePath);
            const fs = require('fs');
            const probeCwd = fs.existsSync(fileDir) ? fileDir : undefined;
            if (!probeCwd) {
                return;
            }
            const { promisify } = require('util');
            const { exec } = require('child_process');
            const execP = promisify(exec);
            const { stdout } = await execP('git rev-parse --show-toplevel', { cwd: probeCwd });
            const repoRoot = stdout.trim();
            if (repoRoot && repoRoot !== projectHistoryTreeProvider.getCurrentRepoRoot()) {
                await projectHistoryTreeProvider.showProjectHistory(repoRoot);
                updateProjectViewTitle();
            }
        } catch {
            // not a git repo, ignore
        }
    };

    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(() => {
        statusBar.updateStatusBar();
        if (projectRefreshTimer) {
            clearTimeout(projectRefreshTimer);
        }
        projectRefreshTimer = setTimeout(autoRefreshProjectHistory, 300);
    });

    // 文件保存后 debounce 刷新项目历史（捕获外部 commit/push）
    const onDidSaveDocument = vscode.workspace.onDidSaveTextDocument(() => {
        if (projectRefreshTimer) {
            clearTimeout(projectRefreshTimer);
        }
        projectRefreshTimer = setTimeout(async () => {
            const repoRoot = projectHistoryTreeProvider.getCurrentRepoRoot();
            if (repoRoot) {
                await projectHistoryTreeProvider.showProjectHistory(repoRoot);
                updateProjectViewTitle();
            }
        }, 2000);
    });

    // 激活时自动加载当前文件所属仓库的项目历史
    autoRefreshProjectHistory();

    context.subscriptions.push(
        lineTreeView,
        fileTreeView,
        projectTreeView,
        statusBar,
        onDidChangeActiveEditor,
        onDidSaveDocument,
        showLineHistoryCommand,
        showFileHistoryCommand,
        refreshCommand,
        showCommitDiffCommand,
        showLineCommitDiffCommand,
        copyCommitHashCommand,
        focusCommand,
        loadMoreLineHistoryCommand,
        loadMoreFileHistoryCommand,
        showProjectHistoryCommand,
        loadMoreProjectHistoryCommand,
        amendLatestCommitMessageCommand,
        softResetLatestToUpstreamCommand
    );
}

export function deactivate() {
    if (gitHistoryProvider) {
        gitHistoryProvider.dispose();
    }
}
