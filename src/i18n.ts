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