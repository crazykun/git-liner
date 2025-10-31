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

        // 显示Git History活动栏
        await vscode.commands.executeCommand('gitHistoryViewer.focus');
        
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

        // 显示Git History活动栏
        await vscode.commands.executeCommand('gitHistoryViewer.focus');
        
        // 返回信息给侧边栏
        return { filePath };
    });
}

