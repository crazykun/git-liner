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

    // 检查文件是否在Git仓库中
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
    if (!workspaceFolder) {
        vscode.window.showWarningMessage('文件不在工作区中');
        return;
    }

    // 获取当前行的内容用于显示
    const currentLine = editor.document.lineAt(selection.active.line);
    const lineContent = currentLine.text.trim();
    const displayContent = lineContent.length > 50 ? lineContent.substring(0, 50) + '...' : lineContent;

    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `正在获取第${lineNumber}行的修改历史...`,
        cancellable: false
    }, async () => {
        const commits = await gitHistoryProvider.getLineHistory(filePath, lineNumber);
        
        if (commits.length === 0) {
            vscode.window.showInformationMessage(`第${lineNumber}行未找到修改历史${displayContent ? `: "${displayContent}"` : ''}`);
            return;
        }

        // 显示成功消息
        vscode.window.showInformationMessage(`找到第${lineNumber}行的${commits.length}个修改记录${displayContent ? `: "${displayContent}"` : ''}`);

        // 显示Git Liner活动栏
        await vscode.commands.executeCommand('gitLiner.focus');
        
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

        // 显示Git Liner活动栏
        await vscode.commands.executeCommand('gitLiner.focus');
        
        // 返回信息给侧边栏
        return { filePath };
    });
}

