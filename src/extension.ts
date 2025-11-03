import * as vscode from 'vscode';
import { GitHistoryProvider } from './gitHistoryProvider';
import { showLineHistory, showFileHistory } from './commands';
import {
    LineHistoryTreeProvider,
    FileHistoryTreeProvider,
    SmartRefreshManager,
} from './historyTreeProvider';
import { GitHistoryStatusBar } from './statusBar';

let gitHistoryProvider: GitHistoryProvider;

export function activate(context: vscode.ExtensionContext) {
    gitHistoryProvider = new GitHistoryProvider();
    const lineHistoryTreeProvider = new LineHistoryTreeProvider(gitHistoryProvider);
    const fileHistoryTreeProvider = new FileHistoryTreeProvider(gitHistoryProvider);
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
            lineTreeView.title = `行历史: ${fileName}:${info.lineNumber}`;
        } else {
            lineTreeView.title = '行历史';
        }
    };

    const updateFileViewTitle = () => {
        const info = fileHistoryTreeProvider.getCurrentInfo();
        if (info.filePath) {
            const fileName = vscode.workspace.asRelativePath(info.filePath);
            fileTreeView.title = `文件历史: ${fileName}`;
        } else {
            fileTreeView.title = '文件历史';
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
        await smartRefreshManager.smartRefresh();
        updateLineViewTitle();
        updateFileViewTitle();
    });

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
                vscode.window.showInformationMessage(`已复制提交Hash: ${item.commit.hash}`);
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

    // 监听编辑器变化以更新状态栏
    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(() => {
        statusBar.updateStatusBar();
    });

    context.subscriptions.push(
        lineTreeView,
        fileTreeView,
        statusBar,
        onDidChangeActiveEditor,
        showLineHistoryCommand,
        showFileHistoryCommand,
        refreshCommand,
        showCommitDiffCommand,
        showLineCommitDiffCommand,
        copyCommitHashCommand,
        focusCommand,
        loadMoreLineHistoryCommand,
        loadMoreFileHistoryCommand
    );
}

export function deactivate() {
    if (gitHistoryProvider) {
        gitHistoryProvider.dispose();
    }
}
