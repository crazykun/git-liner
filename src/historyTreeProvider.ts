import * as vscode from 'vscode';
import { GitHistoryProvider, GitCommit } from './gitHistoryProvider';

interface CacheKey {
    filePath: string;
    lineNumber?: number;
    type: 'file' | 'line';
}

interface CacheEntry {
    commits: GitCommit[];
    timestamp: number;
}

class HistoryCache {
    private cache = new Map<string, CacheEntry>();
    private readonly CACHE_DURATION = 30000; // 30秒缓存

    private getCacheKey(key: CacheKey): string {
        return `${key.type}:${key.filePath}${key.lineNumber ? `:${key.lineNumber}` : ''}`;
    }

    get(key: CacheKey): GitCommit[] | null {
        const cacheKey = this.getCacheKey(key);
        const entry = this.cache.get(cacheKey);
        
        if (!entry) {
            return null;
        }

        // 检查缓存是否过期
        if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
            this.cache.delete(cacheKey);
            return null;
        }

        return entry.commits;
    }

    set(key: CacheKey, commits: GitCommit[]): void {
        const cacheKey = this.getCacheKey(key);
        this.cache.set(cacheKey, {
            commits,
            timestamp: Date.now()
        });
    }

    clear(): void {
        this.cache.clear();
    }

    invalidateFile(filePath: string): void {
        for (const [key] of this.cache) {
            if (key.includes(filePath)) {
                this.cache.delete(key);
            }
        }
    }
}

export class HistoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly commit: GitCommit,
        public readonly filePath?: string,
        public readonly lineNumber?: number
    ) {
        super(commit.message, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = `提交: ${commit.hash}\n作者: ${commit.author}\n日期: ${commit.date}\n消息: ${commit.message}${commit.changes ? '\n变更: ' + commit.changes : ''}`;
        this.description = `${commit.hash} • ${commit.author}`;
        
        // 根据是否有行号设置不同的上下文值和图标
        if (this.lineNumber !== undefined) {
            this.contextValue = 'lineCommit';
            this.iconPath = new vscode.ThemeIcon('symbol-line');
            this.tooltip += `\n行号: ${this.lineNumber}`;
            
            // 行级别的差异命令
            this.command = {
                command: 'gitHistoryViewer.showLineCommitDiff',
                title: '查看行级别差异',
                arguments: [this.filePath, this.commit.fullHash, this.lineNumber]
            };
        } else {
            this.contextValue = 'fileCommit';
            this.iconPath = new vscode.ThemeIcon('git-commit');
            
            // 文件级别的差异命令
            this.command = {
                command: 'gitHistoryViewer.showCommitDiff',
                title: '查看文件差异',
                arguments: [this.filePath, this.commit.fullHash]
            };
        }

        // 添加标签显示日期
        this.resourceUri = vscode.Uri.parse(`git-history:${commit.hash}`);
    }
}

export class LineHistoryTreeProvider implements vscode.TreeDataProvider<HistoryTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryTreeItem | undefined | null | void> = new vscode.EventEmitter<HistoryTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HistoryTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private commits: GitCommit[] = [];
    private currentFilePath?: string;
    private currentLineNumber?: number;

    constructor(private gitHistoryProvider: GitHistoryProvider) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async showLineHistory(filePath: string, lineNumber: number): Promise<void> {
        this.currentFilePath = filePath;
        this.currentLineNumber = lineNumber;
        
        try {
            this.commits = await this.gitHistoryProvider.getLineHistory(filePath, lineNumber);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`获取行历史失败: ${error}`);
        }
    }

    async showLineHistoryFromCache(filePath: string, lineNumber: number, commits: GitCommit[]): Promise<void> {
        this.currentFilePath = filePath;
        this.currentLineNumber = lineNumber;
        this.commits = commits;
        this.refresh();
    }

    async refreshFromCurrentEditor(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('请先打开一个文件');
            return;
        }

        const selection = editor.selection;
        const lineNumber = selection.active.line + 1;
        const filePath = editor.document.fileName;

        await this.showLineHistory(filePath, lineNumber);
    }

    getTreeItem(element: HistoryTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<HistoryTreeItem[]> {
        if (this.commits.length === 0) {
            return Promise.resolve([]);
        }

        return Promise.resolve(
            this.commits.map(commit => 
                new HistoryTreeItem(commit, this.currentFilePath, this.currentLineNumber)
            )
        );
    }

    getParent(): vscode.ProviderResult<HistoryTreeItem> {
        return null;
    }

    getCurrentInfo(): { filePath?: string; lineNumber?: number; type: string } {
        return {
            filePath: this.currentFilePath,
            lineNumber: this.currentLineNumber,
            type: 'line'
        };
    }
}

export class FileHistoryTreeProvider implements vscode.TreeDataProvider<HistoryTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryTreeItem | undefined | null | void> = new vscode.EventEmitter<HistoryTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HistoryTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private commits: GitCommit[] = [];
    private currentFilePath?: string;

    constructor(private gitHistoryProvider: GitHistoryProvider) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async showFileHistory(filePath: string): Promise<void> {
        this.currentFilePath = filePath;
        
        try {
            this.commits = await this.gitHistoryProvider.getFileHistory(filePath);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`获取文件历史失败: ${error}`);
        }
    }

    async showFileHistoryFromCache(filePath: string, commits: GitCommit[]): Promise<void> {
        this.currentFilePath = filePath;
        this.commits = commits;
        this.refresh();
    }

    async refreshFromCurrentEditor(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('请先打开一个文件');
            return;
        }

        const filePath = editor.document.fileName;
        await this.showFileHistory(filePath);
    }

    getTreeItem(element: HistoryTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<HistoryTreeItem[]> {
        if (this.commits.length === 0) {
            return Promise.resolve([]);
        }

        return Promise.resolve(
            this.commits.map(commit => 
                new HistoryTreeItem(commit, this.currentFilePath)
            )
        );
    }

    getParent(): vscode.ProviderResult<HistoryTreeItem> {
        return null;
    }

    getCurrentInfo(): { filePath?: string; type: string } {
        return {
            filePath: this.currentFilePath,
            type: 'file'
        };
    }
}

export class SmartRefreshManager {
    private cache = new HistoryCache();
    private lastRefreshContext?: {
        filePath: string;
        lineNumber?: number;
        type: 'file' | 'line';
    };

    constructor(
        private gitHistoryProvider: GitHistoryProvider,
        private lineHistoryProvider: LineHistoryTreeProvider,
        private fileHistoryProvider: FileHistoryTreeProvider,
        private lineTreeView: vscode.TreeView<HistoryTreeItem>,
        private fileTreeView: vscode.TreeView<HistoryTreeItem>
    ) {
        // 监听文件保存事件，清除相关缓存
        vscode.workspace.onDidSaveTextDocument((document) => {
            this.cache.invalidateFile(document.fileName);
        });
    }

    async smartRefresh(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('请先打开一个文件');
            return;
        }

        const filePath = editor.document.fileName;
        const selection = editor.selection;
        const lineNumber = selection.active.line + 1;

        // 检查是否是Git仓库中的文件
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('文件不在工作区中');
            return;
        }

        // 智能决策：应该刷新哪个视图
        const shouldRefreshLine = this.shouldRefreshLineHistory(filePath, lineNumber);
        const shouldRefreshFile = this.shouldRefreshFileHistory(filePath);

        const refreshPromises: Promise<void>[] = [];

        if (shouldRefreshLine) {
            refreshPromises.push(this.refreshLineHistoryWithCache(filePath, lineNumber));
        }

        if (shouldRefreshFile) {
            refreshPromises.push(this.refreshFileHistoryWithCache(filePath));
        }

        if (refreshPromises.length === 0) {
            // 默认刷新文件历史
            refreshPromises.push(this.refreshFileHistoryWithCache(filePath));
        }

        await Promise.all(refreshPromises);

        // 智能聚焦到最相关的视图
        this.smartFocus(shouldRefreshLine, shouldRefreshFile);

        // 更新上次刷新的上下文
        this.lastRefreshContext = {
            filePath,
            lineNumber: shouldRefreshLine ? lineNumber : undefined,
            type: shouldRefreshLine ? 'line' : 'file'
        };
    }

    private shouldRefreshLineHistory(filePath: string, lineNumber: number): boolean {
        // 如果当前行历史视图是可见的且有数据
        if (this.lineTreeView.visible) {
            return true;
        }

        // 如果上次刷新的是行历史，且是同一个文件
        if (this.lastRefreshContext?.type === 'line' && 
            this.lastRefreshContext.filePath === filePath) {
            return true;
        }

        // 如果行历史视图有当前文件的数据
        const lineInfo = this.lineHistoryProvider.getCurrentInfo();
        if (lineInfo.filePath === filePath) {
            return true;
        }

        return false;
    }

    private shouldRefreshFileHistory(filePath: string): boolean {
        // 如果当前文件历史视图是可见的
        if (this.fileTreeView.visible) {
            return true;
        }

        // 如果上次刷新的是文件历史，且是同一个文件
        if (this.lastRefreshContext?.type === 'file' && 
            this.lastRefreshContext.filePath === filePath) {
            return true;
        }

        // 如果文件历史视图有当前文件的数据
        const fileInfo = this.fileHistoryProvider.getCurrentInfo();
        if (fileInfo.filePath === filePath) {
            return true;
        }

        // 默认情况下刷新文件历史
        return true;
    }

    private async refreshLineHistoryWithCache(filePath: string, lineNumber: number): Promise<void> {
        const cacheKey: CacheKey = { filePath, lineNumber, type: 'line' };
        let commits = this.cache.get(cacheKey);

        if (!commits) {
            commits = await this.gitHistoryProvider.getLineHistory(filePath, lineNumber);
            this.cache.set(cacheKey, commits);
        }

        await this.lineHistoryProvider.showLineHistoryFromCache(filePath, lineNumber, commits);
    }

    private async refreshFileHistoryWithCache(filePath: string): Promise<void> {
        const cacheKey: CacheKey = { filePath, type: 'file' };
        let commits = this.cache.get(cacheKey);

        if (!commits) {
            commits = await this.gitHistoryProvider.getFileHistory(filePath);
            this.cache.set(cacheKey, commits);
        }

        await this.fileHistoryProvider.showFileHistoryFromCache(filePath, commits);
    }

    private smartFocus(shouldRefreshLine: boolean, shouldRefreshFile: boolean): void {
        if (shouldRefreshLine && !shouldRefreshFile) {
            // 只刷新了行历史，聚焦到行历史视图
            vscode.commands.executeCommand('gitHistoryViewer.lineHistoryView.focus');
        } else if (shouldRefreshFile && !shouldRefreshLine) {
            // 只刷新了文件历史，聚焦到文件历史视图
            vscode.commands.executeCommand('gitHistoryViewer.fileHistoryView.focus');
        } else if (shouldRefreshLine && shouldRefreshFile) {
            // 两个都刷新了，聚焦到当前可见的视图，或者默认文件历史
            if (this.lineTreeView.visible) {
                vscode.commands.executeCommand('gitHistoryViewer.lineHistoryView.focus');
            } else {
                vscode.commands.executeCommand('gitHistoryViewer.fileHistoryView.focus');
            }
        }
    }

    clearCache(): void {
        this.cache.clear();
    }
}

// 保持向后兼容的别名
export class HistoryTreeProvider extends FileHistoryTreeProvider {}