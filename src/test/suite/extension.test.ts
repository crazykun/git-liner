import * as assert from 'assert';
import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
import { GitHistoryProvider } from '../../gitHistoryProvider';

const execFileAsync = promisify(execFile);

async function replaceWorkspaceFolders(folders: readonly vscode.WorkspaceFolder[]): Promise<void> {
    const change = new Promise<void>((resolve) => {
        const disposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
            disposable.dispose();
            resolve();
        });
    });

    const count = vscode.workspace.workspaceFolders?.length ?? 0;
    const ok = vscode.workspace.updateWorkspaceFolders(
        0,
        count,
        ...folders.map((folder) => ({ uri: folder.uri, name: folder.name }))
    );

    assert.ok(ok, 'Should update workspace folders');
    await change;
}

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

    test('GitHistoryProvider loads history for nested Git repository files from parent workspace', async () => {
        const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-liner-parent-'));
        const nestedRepo = path.join(tempRoot, 'zhw_quick_go');
        const targetDir = path.join(nestedRepo, 'internal', 'logic', 'mobile');
        const targetFile = path.join(targetDir, 'cloudlogic.go');
        const originalFolders = vscode.workspace.workspaceFolders ?? [];

        try {
            await fs.promises.mkdir(targetDir, { recursive: true });
            await execFileAsync('git', ['init'], { cwd: nestedRepo });
            await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: nestedRepo });
            await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: nestedRepo });
            await fs.promises.writeFile(targetFile, 'package mobile\n', 'utf8');
            await execFileAsync('git', ['add', 'internal/logic/mobile/cloudlogic.go'], { cwd: nestedRepo });
            await execFileAsync('git', ['commit', '-m', 'add cloud logic'], { cwd: nestedRepo });

            await replaceWorkspaceFolders([
                {
                    uri: vscode.Uri.file(tempRoot),
                    name: 'zhw_quick',
                    index: 0,
                },
            ]);

            const provider = new GitHistoryProvider();
            const commits = await provider.getFileHistory(targetFile);
            const paginatedCommits = await provider.getFileHistoryPaginated(targetFile, 0, 20);

            assert.strictEqual(commits.length, 1, 'Should find history in the nested Git repository');
            assert.strictEqual(commits[0].message, 'add cloud logic');
            assert.strictEqual(
                paginatedCommits.items.length,
                1,
                'Should find paginated history in the nested Git repository'
            );
            assert.strictEqual(paginatedCommits.items[0].message, 'add cloud logic');
        } finally {
            await replaceWorkspaceFolders(originalFolders);
            await fs.promises.rm(tempRoot, { recursive: true, force: true });
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
