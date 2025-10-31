import * as vscode from 'vscode';
import { GitHistoryProvider } from './gitHistoryProvider';
import { showLineHistory, showFileHistory } from './commands';
import { HistoryTreeProvider } from './historyTreeProvider';
import { GitHistoryStatusBar } from './statusBar';

export function activate(context: vscode.ExtensionContext) {
    const gitHistoryProvider = new GitHistoryProvider();
    const historyTreeProvider = new HistoryTreeProvider(gitHistoryProvider);
    const statusBar = new GitHistoryStatusBar();

    // 注册侧边栏视图
    const treeView = vscode.window.createTreeView('gitHistoryViewer.historyView', {
        treeDataProvider: historyTreeProvider,
        showCollapseAll: false
    });

    // 更新视图标题
    const updateViewTitle = () => {
        const info = historyTreeProvider.getCurrentInfo();
        if (info.type === 'file' && info.filePath) {
            const fileName = vscode.workspace.asRelativePath(info.filePath);
            treeView.title = `文件历史: ${fileName}`;
        } else if (info.type === 'line' && info.filePath && info.lineNumber) {
            const fileName = vscode.workspace.asRelativePath(info.filePath);
            treeView.title = `行历史: ${fileName}:${info.lineNumber}`;
        } else {
            treeView.title = 'Git历史记录';
        }
    };

    // 注册命令
    const showLineHistoryCommand = vscode.commands.registerCommand(
        'gitHistoryViewer.showLineHistory',
        async () => {
            const result = await showLineHistory(gitHistoryProvider);
            if (result) {
                await historyTreeProvider.showLineHistory(result.filePath, result.lineNumber);
                updateViewTitle();
            }
        }
    );

    const showFileHistoryCommand = vscode.commands.registerCommand(
        'gitHistoryViewer.showFileHistory', 
        async () => {
            const result = await showFileHistory(gitHistoryProvider);
            if (result) {
                await historyTreeProvider.showFileHistory(result.filePath);
                updateViewTitle();
            }
        }
    );

    const refreshCommand = vscode.commands.registerCommand(
        'gitHistoryViewer.refresh',
        () => {
            historyTreeProvider.refresh();
        }
    );

    const showCommitDiffCommand = vscode.commands.registerCommand(
        'gitHistoryViewer.showCommitDiff',
        async (filePath?: string, commitHash?: string) => {
            if (filePath && commitHash) {
                await gitHistoryProvider.showCommitDiff(filePath, commitHash);
            }
        }
    );

    const copyCommitHashCommand = vscode.commands.registerCommand(
        'gitHistoryViewer.copyCommitHash',
        async (item: any) => {
            if (item && item.commit) {
                await vscode.env.clipboard.writeText(item.commit.fullHash);
                vscode.window.showInformationMessage(`已复制提交Hash: ${item.commit.hash}`);
            }
        }
    );

    // 监听编辑器变化以更新状态栏
    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(() => {
        statusBar.updateStatusBar();
    });

    context.subscriptions.push(
        treeView,
        statusBar,
        onDidChangeActiveEditor,
        showLineHistoryCommand,
        showFileHistoryCommand,
        refreshCommand,
        showCommitDiffCommand,
        copyCommitHashCommand
    );
}

export function deactivate() {}