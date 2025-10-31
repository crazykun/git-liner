import * as vscode from 'vscode';
import { GitHistoryProvider, GitCommit } from './gitHistoryProvider';

export class HistoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly commit: GitCommit,
        public readonly filePath?: string,
        public readonly lineNumber?: number
    ) {
        super(commit.message, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = `提交: ${commit.hash}\n作者: ${commit.author}\n日期: ${commit.date}\n消息: ${commit.message}${commit.changes ? '\n变更: ' + commit.changes : ''}`;
        this.description = `${commit.hash} • ${commit.author}`;
        this.contextValue = 'commit';
        
        // 设置图标
        this.iconPath = new vscode.ThemeIcon('git-commit');
        
        // 设置命令，点击时显示差异
        this.command = {
            command: 'gitHistoryViewer.showCommitDiff',
            title: '查看提交差异',
            arguments: [this.filePath, this.commit.fullHash]
        };

        // 添加标签显示日期
        this.resourceUri = vscode.Uri.parse(`git-history:${commit.hash}`);
    }
}

export class HistoryTreeProvider implements vscode.TreeDataProvider<HistoryTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryTreeItem | undefined | null | void> = new vscode.EventEmitter<HistoryTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HistoryTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private commits: GitCommit[] = [];
    private currentFilePath?: string;
    private currentLineNumber?: number;
    private historyType: 'file' | 'line' | 'none' = 'none';

    constructor(private gitHistoryProvider: GitHistoryProvider) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async showFileHistory(filePath: string): Promise<void> {
        this.currentFilePath = filePath;
        this.currentLineNumber = undefined;
        this.historyType = 'file';
        
        try {
            this.commits = await this.gitHistoryProvider.getFileHistory(filePath);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`获取文件历史失败: ${error}`);
        }
    }

    async showLineHistory(filePath: string, lineNumber: number): Promise<void> {
        this.currentFilePath = filePath;
        this.currentLineNumber = lineNumber;
        this.historyType = 'line';
        
        try {
            this.commits = await this.gitHistoryProvider.getLineHistory(filePath, lineNumber);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`获取行历史失败: ${error}`);
        }
    }

    getTreeItem(element: HistoryTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: HistoryTreeItem): Thenable<HistoryTreeItem[]> {
        if (!element) {
            // 根节点，返回所有提交
            if (this.commits.length === 0) {
                return Promise.resolve([]);
            }

            return Promise.resolve(
                this.commits.map(commit => 
                    new HistoryTreeItem(commit, this.currentFilePath, this.currentLineNumber)
                )
            );
        }
        
        return Promise.resolve([]);
    }

    getParent(element: HistoryTreeItem): vscode.ProviderResult<HistoryTreeItem> {
        return null;
    }

    getCurrentInfo(): { filePath?: string; lineNumber?: number; type: string } {
        return {
            filePath: this.currentFilePath,
            lineNumber: this.currentLineNumber,
            type: this.historyType
        };
    }
}