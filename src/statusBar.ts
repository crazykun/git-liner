import * as vscode from 'vscode';

export class GitHistoryStatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'gitLiner.showFileHistory';
        this.updateStatusBar();
    }

    updateStatusBar(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fileName = vscode.workspace.asRelativePath(editor.document.fileName);
            this.statusBarItem.text = `$(git-branch) ${fileName}`;
            this.statusBarItem.tooltip = '点击查看文件Git历史';
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
