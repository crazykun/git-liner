import * as assert from 'assert';
import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
import { GitHistoryProvider } from '../../gitHistoryProvider';
import { ProjectHistoryTreeProvider, LoadMoreTreeItem } from '../../historyTreeProvider';

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

    test('Project history paginates commits from repo root', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-liner-project-'));

        try {
            await execFileAsync('git', ['init'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'commit.gpgsign', 'false'], { cwd: repoRoot });

            for (let i = 1; i <= 25; i++) {
                const filePath = path.join(repoRoot, `file-${i}.txt`);
                await fs.promises.writeFile(filePath, `version ${i}\n`, 'utf8');
                await execFileAsync('git', ['add', `file-${i}.txt`], { cwd: repoRoot });
                await execFileAsync('git', ['commit', '-m', `commit ${i}`], { cwd: repoRoot });
            }

            const provider = new GitHistoryProvider();
            const firstPage = await provider.getProjectHistoryPaginated(repoRoot, 0, 20);
            const secondPage = await provider.getProjectHistoryPaginated(repoRoot, 1, 20);

            assert.strictEqual(firstPage.items.length, 20, 'First page should contain pageSize commits');
            assert.strictEqual(firstPage.hasMore, true, 'First page should have more commits');
            assert.strictEqual(firstPage.totalCount, 25, 'Should report total commit count');
            assert.strictEqual(firstPage.items[0].message, 'commit 25', 'Latest commit should be first');

            assert.strictEqual(secondPage.items.length, 5, 'Second page should contain remaining commits');
            assert.strictEqual(secondPage.hasMore, false, 'Second page should not have more commits');
            assert.strictEqual(secondPage.items[secondPage.items.length - 1].message, 'commit 1', 'Oldest commit last');
        } finally {
            await fs.promises.rm(repoRoot, { recursive: true, force: true });
        }
    });

    test('Upstream status reports ahead commits', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-liner-upstream-'));

        try {
            await execFileAsync('git', ['init', '--initial-branch=main'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'commit.gpgsign', 'false'], { cwd: repoRoot });

            const initialFile = path.join(repoRoot, 'a.txt');
            await fs.promises.writeFile(initialFile, 'a\n', 'utf8');
            await execFileAsync('git', ['add', 'a.txt'], { cwd: repoRoot });
            await execFileAsync('git', ['commit', '-m', 'initial'], { cwd: repoRoot });

            const provider = new GitHistoryProvider();
            const noUpstreamStatus = await provider.getUpstreamStatus(repoRoot);
            assert.strictEqual(noUpstreamStatus.upstream, null, 'No upstream initially');
            assert.deepStrictEqual(noUpstreamStatus.aheadHashes, [], 'No ahead commits without upstream');

            const { stdout: initialHash } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot });
            await execFileAsync('git', ['remote', 'add', 'origin', repoRoot], { cwd: repoRoot });
            await execFileAsync('git', ['update-ref', 'refs/remotes/origin/main', initialHash.trim()], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'branch.main.remote', 'origin'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'branch.main.merge', 'refs/heads/main'], { cwd: repoRoot });

            await fs.promises.writeFile(path.join(repoRoot, 'b.txt'), 'b\n', 'utf8');
            await execFileAsync('git', ['add', 'b.txt'], { cwd: repoRoot });
            await execFileAsync('git', ['commit', '-m', 'second'], { cwd: repoRoot });
            const { stdout: headHash } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot });

            const aheadStatus = await provider.getUpstreamStatus(repoRoot);
            assert.strictEqual(aheadStatus.upstream, 'origin/main', 'Should report upstream ref');
            assert.deepStrictEqual(
                aheadStatus.aheadHashes,
                [headHash.trim()],
                'Should list local-only commits in HEAD->upstream order'
            );
        } finally {
            await fs.promises.rm(repoRoot, { recursive: true, force: true });
        }
    });

    test('ProjectHistoryTreeProvider marks unpushed HEAD only when ahead', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-liner-projview-'));

        try {
            await execFileAsync('git', ['init', '--initial-branch=main'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'commit.gpgsign', 'false'], { cwd: repoRoot });
            await fs.promises.writeFile(path.join(repoRoot, 'a.txt'), 'a\n', 'utf8');
            await execFileAsync('git', ['add', 'a.txt'], { cwd: repoRoot });
            await execFileAsync('git', ['commit', '-m', 'initial'], { cwd: repoRoot });

            const gitProvider = new GitHistoryProvider();
            const treeProvider = new ProjectHistoryTreeProvider(gitProvider);

            await treeProvider.showProjectHistory(repoRoot);
            const noAheadChildren = await Promise.resolve(treeProvider.getChildren());
            assert.strictEqual(noAheadChildren.length, 1, 'Should show single commit');
            assert.strictEqual(noAheadChildren[0].contextValue, 'projectCommit', 'No ahead => projectCommit');

            const { stdout: initialHash } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot });
            await execFileAsync('git', ['remote', 'add', 'origin', repoRoot], { cwd: repoRoot });
            await execFileAsync('git', ['update-ref', 'refs/remotes/origin/main', initialHash.trim()], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'branch.main.remote', 'origin'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'branch.main.merge', 'refs/heads/main'], { cwd: repoRoot });
            await fs.promises.writeFile(path.join(repoRoot, 'b.txt'), 'b\n', 'utf8');
            await execFileAsync('git', ['add', 'b.txt'], { cwd: repoRoot });
            await execFileAsync('git', ['commit', '-m', 'unpushed'], { cwd: repoRoot });

            await treeProvider.showProjectHistory(repoRoot);
            const aheadChildren = await Promise.resolve(treeProvider.getChildren());
            assert.strictEqual(aheadChildren.length, 2, 'Should list two commits');
            assert.strictEqual(aheadChildren[0].contextValue, 'projectCommitUnpushedHead', 'Top commit gated for ops');
            assert.strictEqual(aheadChildren[1].contextValue, 'projectCommit', 'Older commits stay projectCommit');
        } finally {
            await fs.promises.rm(repoRoot, { recursive: true, force: true });
        }
    });

    test('ProjectHistoryTreeProvider appends LoadMore when more pages exist', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-liner-projview-more-'));

        try {
            await execFileAsync('git', ['init'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'commit.gpgsign', 'false'], { cwd: repoRoot });
            for (let i = 1; i <= 22; i++) {
                await fs.promises.writeFile(path.join(repoRoot, `f${i}.txt`), `${i}\n`, 'utf8');
                await execFileAsync('git', ['add', `f${i}.txt`], { cwd: repoRoot });
                await execFileAsync('git', ['commit', '-m', `c${i}`], { cwd: repoRoot });
            }

            const gitProvider = new GitHistoryProvider();
            const treeProvider = new ProjectHistoryTreeProvider(gitProvider);

            await treeProvider.showProjectHistory(repoRoot);
            const firstPage = await Promise.resolve(treeProvider.getChildren());
            assert.strictEqual(firstPage.length, 21, 'Page 1 = 20 commits + LoadMore');
            assert.ok(firstPage[firstPage.length - 1] instanceof LoadMoreTreeItem, 'Last item should be LoadMore');

            await treeProvider.loadMoreProjectHistory(repoRoot, 1);
            const afterMore = await Promise.resolve(treeProvider.getChildren());
            assert.strictEqual(afterMore.length, 22, 'After loading more, all 22 commits shown');
            assert.ok(!(afterMore[afterMore.length - 1] instanceof LoadMoreTreeItem), 'No LoadMore left');
        } finally {
            await fs.promises.rm(repoRoot, { recursive: true, force: true });
        }
    });

    test('amendCommitMessage updates HEAD subject and preserves parent', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-liner-amend-'));

        try {
            await execFileAsync('git', ['init'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'commit.gpgsign', 'false'], { cwd: repoRoot });
            await fs.promises.writeFile(path.join(repoRoot, 'a.txt'), 'a\n', 'utf8');
            await execFileAsync('git', ['add', 'a.txt'], { cwd: repoRoot });
            await execFileAsync('git', ['commit', '-m', 'old1'], { cwd: repoRoot });
            const { stdout: parentBefore } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot });
            await fs.promises.writeFile(path.join(repoRoot, 'b.txt'), 'b\n', 'utf8');
            await execFileAsync('git', ['add', 'b.txt'], { cwd: repoRoot });
            await execFileAsync('git', ['commit', '-m', 'old2'], { cwd: repoRoot });

            const provider = new GitHistoryProvider();
            await provider.amendCommitMessage(repoRoot, 'new commit subject');

            const { stdout: subject } = await execFileAsync('git', ['log', '-1', '--pretty=%s'], { cwd: repoRoot });
            const { stdout: parentAfter } = await execFileAsync('git', ['rev-parse', 'HEAD~1'], { cwd: repoRoot });
            assert.strictEqual(subject.trim(), 'new commit subject');
            assert.strictEqual(parentAfter.trim(), parentBefore.trim(), 'Parent commit must remain unchanged');
        } finally {
            await fs.promises.rm(repoRoot, { recursive: true, force: true });
        }
    });

    test('amendCommitMessage refuses when index has staged changes', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-liner-amend-staged-'));

        try {
            await execFileAsync('git', ['init'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: repoRoot });
            await execFileAsync('git', ['config', 'commit.gpgsign', 'false'], { cwd: repoRoot });
            await fs.promises.writeFile(path.join(repoRoot, 'a.txt'), 'a\n', 'utf8');
            await execFileAsync('git', ['add', 'a.txt'], { cwd: repoRoot });
            await execFileAsync('git', ['commit', '-m', 'orig'], { cwd: repoRoot });
            await fs.promises.writeFile(path.join(repoRoot, 'a.txt'), 'changed\n', 'utf8');
            await execFileAsync('git', ['add', 'a.txt'], { cwd: repoRoot });

            const provider = new GitHistoryProvider();
            await assert.rejects(provider.amendCommitMessage(repoRoot, 'rename'), /staged|index/i);
            const { stdout: subject } = await execFileAsync('git', ['log', '-1', '--pretty=%s'], { cwd: repoRoot });
            assert.strictEqual(subject.trim(), 'orig', 'Subject unchanged when refused');
        } finally {
            await fs.promises.rm(repoRoot, { recursive: true, force: true });
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
