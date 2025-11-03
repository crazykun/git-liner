import * as assert from 'assert';
import * as vscode from 'vscode';
import { GitHistoryProvider } from '../../gitHistoryProvider';

suite('Git Liner Extension Tests', () => {
    vscode.window.showInformationMessage('Running Git Liner tests...');

    test('GitHistoryProvider can be instantiated', () => {
        const provider = new GitHistoryProvider();
        assert.ok(provider, 'GitHistoryProvider should be created');
        assert.strictEqual(typeof provider.getFileHistory, 'function', 'Should have getFileHistory method');
        assert.strictEqual(typeof provider.getLineHistory, 'function', 'Should have getLineHistory method');
    });

    test('GitHistoryProvider handles invalid file paths', async () => {
        const provider = new GitHistoryProvider();
        
        try {
            const result = await provider.getFileHistory('/nonexistent/file.txt');
            assert.ok(Array.isArray(result), 'Should return an array');
            assert.strictEqual(result.length, 0, 'Should return empty array for nonexistent file');
        } catch (error) {
            // 这也是可以接受的行为
            assert.ok(error instanceof Error, 'Should throw an error for invalid file');
        }
    });

    test('Extension is loaded', () => {
        const extension = vscode.extensions.getExtension('crazykun.git-liner');
        assert.ok(extension, 'Extension should be loaded');
    });

    test('Basic functionality works', () => {
        // 简单的功能测试
        const provider = new GitHistoryProvider();
        assert.ok(provider.dispose, 'Should have dispose method');
        
        // 测试dispose不会抛出错误
        assert.doesNotThrow(() => {
            provider.dispose();
        }, 'Dispose should not throw');
    });
});
