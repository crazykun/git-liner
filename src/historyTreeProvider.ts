import * as vscode from 'vscode';
import { GitHistoryProvider, GitCommit, PaginatedResult } from './gitHistoryProvider';
import { I18n } from './i18n';

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
    private readonly cacheDuration = 30000; // 30秒缓存

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
        if (Date.now() - entry.timestamp > this.cacheDuration) {
            this.cache.delete(cacheKey);
            return null;
        }

        return entry.commits;
    }

    set(key: CacheKey, commits: GitCommit[]): void {
        const cacheKey = this.getCacheKey(key);
        this.cache.set(cacheKey, {
            commits,
            timestamp: Date.now(),
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

export class LoadMoreTreeItem extends vscode.TreeItem {
    constructor(
        public readonly filePath: string,
        public readonly lineNumber?: number,
        public readonly currentPage: number = 0
    ) {
        super('加载更多...', vscode.TreeItemCollapsibleState.None);
        this.tooltip = '点击加载更多历史记录';
        this.iconPath = new vscode.ThemeIcon('refresh');
        this.contextValue = 'loadMore';

        this.command = {
            command:
                lineNumber !== undefined
                    ? 'gitLiner.loadMoreLineHistory'
                    : 'gitLiner.loadMoreFileHistory',
            title: '加载更多',
            arguments: [filePath, lineNumber, currentPage + 1],
        };
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
                command: 'gitLiner.showLineCommitDiff',
                title: '查看行级别差异',
                arguments: [this.filePath, this.commit.fullHash, this.lineNumber],
            };
        } else {
            this.contextValue = 'fileCommit';
            this.iconPath = new vscode.ThemeIcon('git-commit');

            // 文件级别的差异命令
            this.command = {
                command: 'gitLiner.showCommitDiff',
                title: '查看文件差异',
                arguments: [this.filePath, this.commit.fullHash],
            };
        }

        // 添加标签显示日期
        this.resourceUri = vscode.Uri.parse(`git-history:${commit.hash}`);
    }
}

export class LineHistoryTreeProvider
    implements vscode.TreeDataProvider<HistoryTreeItem | LoadMoreTreeItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<
        HistoryTreeItem | LoadMoreTreeItem | undefined | null | void
    > = new vscode.EventEmitter<HistoryTreeItem | LoadMoreTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<
        HistoryTreeItem | LoadMoreTreeItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    private commits: GitCommit[] = [];
    private currentFilePath?: string;
    private currentLineNumber?: number;
    private hasMore: boolean = false;
    private currentPage: number = 0;
    private readonly pageSize: number = 20;

    constructor(private gitHistoryProvider: GitHistoryProvider) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async showLineHistory(filePath: string, lineNumber: number): Promise<void> {
        this.currentFilePath = filePath;
        this.currentLineNumber = lineNumber;
        this.currentPage = 0;
        this.commits = [];

        try {
            const result = await this.gitHistoryProvider.getLineHistoryPaginated(
                filePath,
                lineNumber,
                0,
                this.pageSize
            );
            this.commits = result.items;
            this.hasMore = result.hasMore;
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(I18n.t('error.failedToLoadHistory', error));
        }
    }

    async loadMoreLineHistory(filePath: string, lineNumber: number, page: number): Promise<void> {
        if (filePath !== this.currentFilePath || lineNumber !== this.currentLineNumber) {
            // 如果文件或行号不匹配，重新开始
            await this.showLineHistory(filePath, lineNumber);
            return;
        }

        try {
            const result = await this.gitHistoryProvider.getLineHistoryPaginated(
                filePath,
                lineNumber,
                page,
                this.pageSize
            );
            this.commits = [...this.commits, ...result.items];
            this.hasMore = result.hasMore;
            this.currentPage = page;
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(I18n.t('error.failedToLoadHistory', error));
        }
    }

    async showLineHistoryFromCache(
        filePath: string,
        lineNumber: number,
        commits: GitCommit[]
    ): Promise<void> {
        this.currentFilePath = filePath;
        this.currentLineNumber = lineNumber;
        this.commits = commits;
        this.refresh();
    }

    async refreshFromCurrentEditor(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage(I18n.t('noActiveEditor'));
            return;
        }

        const selection = editor.selection;
        const lineNumber = selection.active.line + 1;
        const filePath = editor.document.fileName;

        await this.showLineHistory(filePath, lineNumber);
    }

    getTreeItem(element: HistoryTreeItem | LoadMoreTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<(HistoryTreeItem | LoadMoreTreeItem)[]> {
        if (this.commits.length === 0) {
            return Promise.resolve([]);
        }

        const items: (HistoryTreeItem | LoadMoreTreeItem)[] = this.commits.map(
            (commit) => new HistoryTreeItem(commit, this.currentFilePath, this.currentLineNumber)
        );

        // 如果还有更多数据，添加"加载更多"项
        if (this.hasMore && this.currentFilePath && this.currentLineNumber !== undefined) {
            items.push(
                new LoadMoreTreeItem(this.currentFilePath, this.currentLineNumber, this.currentPage)
            );
        }

        return Promise.resolve(items);
    }

    getParent(): vscode.ProviderResult<HistoryTreeItem | LoadMoreTreeItem> {
        return null;
    }

    getCurrentInfo(): { filePath?: string; lineNumber?: number; type: string } {
        return {
            filePath: this.currentFilePath,
            lineNumber: this.currentLineNumber,
            type: 'line',
        };
    }
}

export class FileHistoryTreeProvider
    implements vscode.TreeDataProvider<HistoryTreeItem | LoadMoreTreeItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<
        HistoryTreeItem | LoadMoreTreeItem | undefined | null | void
    > = new vscode.EventEmitter<HistoryTreeItem | LoadMoreTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<
        HistoryTreeItem | LoadMoreTreeItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    private commits: GitCommit[] = [];
    private currentFilePath?: string;
    private hasMore: boolean = false;
    private currentPage: number = 0;
    private readonly pageSize: number = 20;

    constructor(private gitHistoryProvider: GitHistoryProvider) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async showFileHistory(filePath: string): Promise<void> {
        this.currentFilePath = filePath;
        this.currentPage = 0;
        this.commits = [];

        try {
            const result = await this.gitHistoryProvider.getFileHistoryPaginated(
                filePath,
                0,
                this.pageSize
            );
            this.commits = result.items;
            this.hasMore = result.hasMore;
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(I18n.t('error.failedToLoadHistory', error));
        }
    }

    async loadMoreFileHistory(filePath: string, page: number): Promise<void> {
        if (filePath !== this.currentFilePath) {
            // 如果文件不匹配，重新开始
            await this.showFileHistory(filePath);
            return;
        }

        try {
            const result = await this.gitHistoryProvider.getFileHistoryPaginated(
                filePath,
                page,
                this.pageSize
            );
            this.commits = [...this.commits, ...result.items];
            this.hasMore = result.hasMore;
            this.currentPage = page;
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(I18n.t('error.failedToLoadHistory', error));
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
            vscode.window.showWarningMessage(I18n.t('noActiveEditor'));
            return;
        }

        const filePath = editor.document.fileName;
        await this.showFileHistory(filePath);
    }

    getTreeItem(element: HistoryTreeItem | LoadMoreTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<(HistoryTreeItem | LoadMoreTreeItem)[]> {
        if (this.commits.length === 0) {
            return Promise.resolve([]);
        }

        const items: (HistoryTreeItem | LoadMoreTreeItem)[] = this.commits.map(
            (commit) => new HistoryTreeItem(commit, this.currentFilePath)
        );

        // 如果还有更多数据，添加"加载更多"项
        if (this.hasMore && this.currentFilePath) {
            items.push(new LoadMoreTreeItem(this.currentFilePath, undefined, this.currentPage));
        }

        return Promise.resolve(items);
    }

    getParent(): vscode.ProviderResult<HistoryTreeItem | LoadMoreTreeItem> {
        return null;
    }

    getCurrentInfo(): { filePath?: string; type: string } {
        return {
            filePath: this.currentFilePath,
            type: 'file',
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
        private lineTreeView: vscode.TreeView<HistoryTreeItem | LoadMoreTreeItem>,
        private fileTreeView: vscode.TreeView<HistoryTreeItem | LoadMoreTreeItem>
    ) {
        // 监听文件保存事件，清除相关缓存
        vscode.workspace.onDidSaveTextDocument((document) => {
            this.cache.invalidateFile(document.fileName);
        });
    }

    async smartRefresh(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage(I18n.t('noActiveEditor'));
            return;
        }

        const filePath = editor.document.fileName;
        const selection = editor.selection;
        const lineNumber = selection.active.line + 1;

        // 检查是否是Git仓库中的文件
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        if (!workspaceFolder) {
            vscode.window.showWarningMessage(I18n.t('fileNotInWorkspace'));
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
            type: shouldRefreshLine ? 'line' : 'file',
        };
    }

    private shouldRefreshLineHistory(filePath: string, lineNumber: number): boolean {
        // 如果当前行历史视图是可见的且有数据
        if (this.lineTreeView.visible) {
            return true;
        }

        // 如果上次刷新的是行历史，且是同一个文件
        if (
            this.lastRefreshContext?.type === 'line' &&
            this.lastRefreshContext.filePath === filePath
        ) {
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
        if (
            this.lastRefreshContext?.type === 'file' &&
            this.lastRefreshContext.filePath === filePath
        ) {
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
            vscode.commands.executeCommand('gitLiner.lineHistoryView.focus');
        } else if (shouldRefreshFile && !shouldRefreshLine) {
            // 只刷新了文件历史，聚焦到文件历史视图
            vscode.commands.executeCommand('gitLiner.fileHistoryView.focus');
        } else if (shouldRefreshLine && shouldRefreshFile) {
            // 两个都刷新了，聚焦到当前可见的视图，或者默认文件历史
            if (this.lineTreeView.visible) {
                vscode.commands.executeCommand('gitLiner.lineHistoryView.focus');
            } else {
                vscode.commands.executeCommand('gitLiner.fileHistoryView.focus');
            }
        }
    }

    clearCache(): void {
        this.cache.clear();
    }
}

// 保持向后兼容的别名
export class HistoryTreeProvider extends FileHistoryTreeProvider {}
