import * as vscode from 'vscode';

/**
 * 国际化工具类
 */
export class I18n {
    private static messages: { [key: string]: string } = {};

    /**
     * 初始化国际化
     */
    public static init(context: vscode.ExtensionContext) {
        // VSCode会根据用户的语言设置自动加载对应的package.nls.*.json文件
        // 这里我们定义一些运行时需要的文本
        const locale = vscode.env.language;
        
        if (locale.startsWith('zh')) {
            this.messages = {
                'lineHistory.title': '行历史',
                'fileHistory.title': '文件历史',
                'lineHistory.titleWithFile': '行历史: {0}:{1}',
                'fileHistory.titleWithFile': '文件历史: {0}',
                'copyCommitHash.success': '已复制提交Hash: {0}',
                'noGitRepository': '当前工作区没有Git仓库',
                'noActiveEditor': '没有活动的编辑器',
                'noFileSelected': '没有选择文件',
                'fileNotInWorkspace': '文件不在工作区中',
                'loadingHistory': '正在加载历史记录...',
                'noHistoryFound': '未找到历史记录',
                'error.failedToLoadHistory': '加载历史记录失败: {0}',
                'error.failedToShowDiff': '显示差异失败: {0}',
                'projectHistory.title': '项目历史',
                'amend.prompt': '请输入新的 commit 信息',
                'amend.empty': 'Commit 信息不能为空',
                'amend.staged': '存在已暂存的改动，无法直接修改 commit 信息，请先 commit 或 unstage',
                'amend.success': '已修改 commit 信息',
                'softReset.confirm': '将本地未推送的 {1} 个提交回退到 {0}，已修改的内容会保留在暂存区，是否继续？',
                'softReset.confirmAction': '确认回退',
                'softReset.success': '已回退到 {0}',
                'softResetLast.confirm': '将最后一次提交回退，已修改的内容会保留在暂存区，是否继续？',
                'softResetLast.confirmAction': '确认回退',
                'softResetLast.success': '已回退最后一次提交',
                'error.noUpstream': '当前分支没有 upstream',
                'error.notUnpushedHead': '最新提交不再是未推送的 HEAD，请刷新视图',
            };
        } else {
            this.messages = {
                'lineHistory.title': 'Line History',
                'fileHistory.title': 'File History',
                'lineHistory.titleWithFile': 'Line History: {0}:{1}',
                'fileHistory.titleWithFile': 'File History: {0}',
                'copyCommitHash.success': 'Copied commit hash: {0}',
                'noGitRepository': 'No Git repository found in current workspace',
                'noActiveEditor': 'No active editor',
                'noFileSelected': 'No file selected',
                'fileNotInWorkspace': 'File is not in workspace',
                'loadingHistory': 'Loading history...',
                'noHistoryFound': 'No history found',
                'error.failedToLoadHistory': 'Failed to load history: {0}',
                'error.failedToShowDiff': 'Failed to show diff: {0}',
                'projectHistory.title': 'Project History',
                'amend.prompt': 'Enter new commit message',
                'amend.empty': 'Commit message cannot be empty',
                'amend.staged': 'There are staged changes; cannot amend message safely. Commit or unstage first.',
                'amend.success': 'Commit message updated',
                'softReset.confirm': 'Soft reset {1} unpushed commit(s) to {0}? Working changes will stay staged.',
                'softReset.confirmAction': 'Reset',
                'softReset.success': 'Reset to {0}',
                'softResetLast.confirm': 'Undo last commit? Changes will stay staged.',
                'softResetLast.confirmAction': 'Undo',
                'softResetLast.success': 'Last commit undone',
                'error.noUpstream': 'Current branch has no upstream',
                'error.notUnpushedHead': 'Latest commit is no longer the unpushed HEAD, please refresh',
            };
        }
    }

    /**
     * 获取本地化文本
     * @param key 文本键
     * @param args 格式化参数
     * @returns 本地化文本
     */
    public static t(key: string, ...args: any[]): string {
        let message = this.messages[key] || key;
        
        // 简单的字符串格式化
        args.forEach((arg, index) => {
            message = message.replace(`{${index}}`, String(arg));
        });
        
        return message;
    }

    /**
     * 检查是否为中文环境
     */
    public static isChinese(): boolean {
        return vscode.env.language.startsWith('zh');
    }
}