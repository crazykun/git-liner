import * as vscode from 'vscode';
import { GitHistoryProvider } from './gitHistoryProvider';
import { showLineHistory, showFileHistory } from './commands';

export function activate(context: vscode.ExtensionContext) {
    const gitHistoryProvider = new GitHistoryProvider();

    // 注册命令
    const showLineHistoryCommand = vscode.commands.registerCommand(
        'gitHistoryViewer.showLineHistory',
        () => showLineHistory(gitHistoryProvider)
    );

    const showFileHistoryCommand = vscode.commands.registerCommand(
        'gitHistoryViewer.showFileHistory', 
        () => showFileHistory(gitHistoryProvider)
    );

    context.subscriptions.push(showLineHistoryCommand, showFileHistoryCommand);
}

export function deactivate() {}