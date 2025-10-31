import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface GitCommit {
    hash: string;
    fullHash: string;  // 添加完整hash
    author: string;
    date: string;
    message: string;
    changes?: string;
}

export class GitHistoryProvider {
    private tempFiles: string[] = [];

    /**
     * 获取指定行的修改历史
     */
    async getLineHistory(filePath: string, lineNumber: number): Promise<GitCommit[]> {
        try {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
            if (!workspaceFolder) {
                throw new Error('文件不在工作区中');
            }

            const relativePath = vscode.workspace.asRelativePath(filePath);
            const cwd = workspaceFolder.uri.fsPath;

            // 使用 git log -L 获取指定行的真实历史
            // -L 选项可以跟踪行的变化历史，即使行号发生变化
            const logCommand = `git log -L ${lineNumber},${lineNumber}:"${relativePath}" --pretty=format:"%H|%an|%ad|%s" --date=short`;
            const { stdout: logOutput } = await execAsync(logCommand, { cwd });

            const commits: GitCommit[] = [];
            const lines = logOutput.split('\n').filter((line: string) => line.trim());

            for (const line of lines) {
                // 跳过diff输出行，只处理提交信息行
                if (line.includes('|') && !line.startsWith('@@') && !line.startsWith('+++') && !line.startsWith('---')) {
                    const parts = line.split('|');
                    if (parts.length >= 4) {
                        const [hash, author, date, ...messageParts] = parts;
                        const message = messageParts.join('|'); // 重新组合消息，防止消息中包含|字符
                        
                        // 避免重复添加相同的提交
                        if (!commits.find(c => c.fullHash === hash)) {
                            commits.push({
                                hash: hash.substring(0, 8),
                                fullHash: hash,
                                author,
                                date,
                                message
                            });
                        }
                    }
                }
            }

            // 如果 git log -L 没有返回结果，尝试使用 git blame 作为备选方案
            if (commits.length === 0) {
                const blameCommand = `git blame -L ${lineNumber},${lineNumber} --porcelain "${relativePath}"`;
                const { stdout: blameOutput } = await execAsync(blameCommand, { cwd });
                
                if (blameOutput.trim()) {
                    const commitHash = blameOutput.split('\n')[0].split(' ')[0];
                    
                    // 获取该提交的详细信息
                    const commitInfoCommand = `git show --pretty=format:"%H|%an|%ad|%s" --no-patch ${commitHash}`;
                    const { stdout: commitInfo } = await execAsync(commitInfoCommand, { cwd });
                    
                    if (commitInfo.trim()) {
                        const [hash, author, date, ...messageParts] = commitInfo.split('|');
                        const message = messageParts.join('|');
                        
                        commits.push({
                            hash: hash.substring(0, 8),
                            fullHash: hash,
                            author,
                            date,
                            message
                        });
                    }
                }
            }

            return commits;
        } catch (error) {
            vscode.window.showErrorMessage(`获取行历史失败: ${error}`);
            return [];
        }
    }

    /**
     * 获取文件的修改历史
     */
    async getFileHistory(filePath: string): Promise<GitCommit[]> {
        try {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
            if (!workspaceFolder) {
                throw new Error('文件不在工作区中');
            }

            const relativePath = vscode.workspace.asRelativePath(filePath);
            const cwd = workspaceFolder.uri.fsPath;

            // 获取文件的提交历史
            const logCommand = `git log --pretty=format:"%H|%an|%ad|%s" --date=short --follow "${relativePath}"`;
            const { stdout: logOutput } = await execAsync(logCommand, { cwd });

            const commits: GitCommit[] = [];
            const lines = logOutput.split('\n').filter((line: string) => line.trim());

            for (const line of lines) {
                const [hash, author, date, message] = line.split('|');

                // 获取该提交中文件的变更统计
                try {
                    const statCommand = `git show --stat --pretty="" ${hash} -- "${relativePath}"`;
                    const { stdout: statOutput } = await execAsync(statCommand, { cwd });

                    commits.push({
                        hash: hash.substring(0, 8),
                        fullHash: hash,  // 保存完整hash
                        author,
                        date,
                        message,
                        changes: statOutput.trim()
                    });
                } catch {
                    commits.push({
                        hash: hash.substring(0, 8),
                        fullHash: hash,  // 保存完整hash
                        author,
                        date,
                        message
                    });
                }
            }

            return commits;
        } catch (error) {
            vscode.window.showErrorMessage(`获取文件历史失败: ${error}`);
            return [];
        }
    }

    /**
     * 显示行级别的提交差异
     */
    async showLineCommitDiff(filePath: string, commitHash: string, lineNumber: number): Promise<void> {
        try {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('文件不在工作区中');
                return;
            }

            const relativePath = vscode.workspace.asRelativePath(filePath);
            const cwd = workspaceFolder.uri.fsPath;

            // 获取提交信息用于标题
            const commitInfoCommand = `git show --pretty=format:"%h %s" --no-patch ${commitHash}`;
            const { stdout: commitInfo } = await execAsync(commitInfoCommand, { cwd });

            // 使用 git log -L 获取该行在这个提交中的具体变化
            const lineLogCommand = `git log -L ${lineNumber},${lineNumber}:"${relativePath}" --pretty=format:"" -p ${commitHash}^..${commitHash}`;
            
            try {
                const { stdout: lineDiff } = await execAsync(lineLogCommand, { cwd });
                
                if (lineDiff.trim()) {
                    // 创建一个临时文件显示行级别的差异
                    const tempDir = os.tmpdir();
                    const diffFile = path.join(tempDir, `line_${lineNumber}_diff_${commitHash.substring(0, 8)}.diff`);
                    
                    const diffContent = `行 ${lineNumber} 在提交 ${commitInfo.trim()} 中的变化:\n\n${lineDiff}`;
                    await fs.promises.writeFile(diffFile, diffContent, 'utf8');
                    
                    this.tempFiles.push(diffFile);
                    
                    const diffUri = vscode.Uri.file(diffFile);
                    await vscode.window.showTextDocument(diffUri, {
                        preview: false,
                        viewColumn: vscode.ViewColumn.Active
                    });
                    
                    // 清理临时文件
                    setTimeout(() => {
                        this.cleanupTempFile(diffFile);
                    }, 5 * 60 * 1000); // 5分钟后清理
                    
                    return;
                }
            } catch (error) {
                console.log('行级别差异获取失败，回退到文件级别差异:', error);
            }
            
            // 如果行级别差异获取失败，回退到显示整个文件的差异
            await this.showCommitDiff(filePath, commitHash);
            
        } catch (error) {
            console.error('显示行级别差异错误:', error);
            vscode.window.showErrorMessage(`显示行级别差异失败: ${error}`);
        }
    }

    /**
     * 显示提交的详细差异
     */
    async showCommitDiff(filePath: string, commitHash: string): Promise<void> {
        try {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('文件不在工作区中');
                return;
            }

            const relativePath = vscode.workspace.asRelativePath(filePath);
            const cwd = workspaceFolder.uri.fsPath;

            // 获取提交信息用于标题
            const commitInfoCommand = `git show --pretty=format:"%h %s" --no-patch ${commitHash}`;
            const { stdout: commitInfo } = await execAsync(commitInfoCommand, { cwd });

            // 获取父提交hash
            const parentCommand = `git rev-parse ${commitHash}^`;
            let parentHash: string;
            try {
                const { stdout: parentOutput } = await execAsync(parentCommand, { cwd });
                parentHash = parentOutput.trim();
            } catch {
                // 如果没有父提交（初始提交），使用空树
                parentHash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
            }

            // 检查文件在两个版本中是否存在
            const checkFileInCommit = async (hash: string): Promise<boolean> => {
                try {
                    await execAsync(`git cat-file -e ${hash}:"${relativePath}"`, { cwd });
                    return true;
                } catch {
                    return false;
                }
            };

            const fileExistsInParent = await checkFileInCommit(parentHash);
            const fileExistsInCommit = await checkFileInCommit(commitHash);

            let leftContent = '';
            let rightContent = '';

            if (fileExistsInParent) {
                // 获取父提交中的文件内容
                const parentFileCommand = `git show ${parentHash}:"${relativePath}"`;
                const { stdout: parentFileContent } = await execAsync(parentFileCommand, { cwd });
                leftContent = parentFileContent;
            } else {
                leftContent = '';
            }

            if (fileExistsInCommit) {
                // 获取当前提交中的文件内容
                const currentFileCommand = `git show ${commitHash}:"${relativePath}"`;
                const { stdout: currentFileContent } = await execAsync(currentFileCommand, { cwd });
                rightContent = currentFileContent;
            } else {
                rightContent = '';
            }

            // 创建临时文件
            const tempDir = os.tmpdir();
            const fileBaseName = path.basename(relativePath);
            const fileExtension = path.extname(relativePath);
            const baseName = path.basename(relativePath, fileExtension);

            const leftTempFile = path.join(tempDir, `${baseName}_${parentHash.substring(0, 8)}${fileExtension}`);
            const rightTempFile = path.join(tempDir, `${baseName}_${commitHash.substring(0, 8)}${fileExtension}`);

            // 写入临时文件
            await fs.promises.writeFile(leftTempFile, leftContent, 'utf8');
            await fs.promises.writeFile(rightTempFile, rightContent, 'utf8');

            // 记录临时文件以便后续清理
            this.tempFiles.push(leftTempFile, rightTempFile);

            // 创建URI
            const leftUri = vscode.Uri.file(leftTempFile);
            const rightUri = vscode.Uri.file(rightTempFile);

            // 使用VS Code的内置diff功能
            const title = `${commitInfo.trim()} - ${relativePath}`;
            await vscode.commands.executeCommand(
                'vscode.diff',
                leftUri,
                rightUri,
                title,
                {
                    preview: false,
                    viewColumn: vscode.ViewColumn.Active
                }
            );

            // 设置文件为只读
            setTimeout(async () => {
                try {
                    const leftDoc = await vscode.workspace.openTextDocument(leftUri);
                    const rightDoc = await vscode.workspace.openTextDocument(rightUri);
                    
                    // 监听文档关闭事件来清理临时文件
                    const disposable = vscode.workspace.onDidCloseTextDocument((doc) => {
                        if (doc.uri.fsPath === leftTempFile || doc.uri.fsPath === rightTempFile) {
                            this.cleanupTempFile(doc.uri.fsPath);
                        }
                    });

                    // 5分钟后自动清理（防止内存泄漏）
                    setTimeout(() => {
                        disposable.dispose();
                        this.cleanupTempFile(leftTempFile);
                        this.cleanupTempFile(rightTempFile);
                    }, 5 * 60 * 1000);

                } catch (error) {
                    console.error('设置只读模式失败:', error);
                }
            }, 100);

        } catch (error) {
            console.error('显示提交差异错误:', error);
            vscode.window.showErrorMessage(`显示提交差异失败: ${error}`);
        }
    }

    /**
     * 清理临时文件
     */
    private cleanupTempFile(filePath: string): void {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            const index = this.tempFiles.indexOf(filePath);
            if (index > -1) {
                this.tempFiles.splice(index, 1);
            }
        } catch (error) {
            console.error('清理临时文件失败:', error);
        }
    }

    /**
     * 清理所有临时文件
     */
    public dispose(): void {
        for (const tempFile of this.tempFiles) {
            this.cleanupTempFile(tempFile);
        }
        this.tempFiles = [];
    }

    /**
     * 根据文件扩展名获取语言ID
     */
    private getLanguageIdFromExtension(extension: string): string {
        const languageMap: { [key: string]: string } = {
            'ts': 'typescript',
            'js': 'javascript',
            'tsx': 'typescriptreact',
            'jsx': 'javascriptreact',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'less': 'less',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'md': 'markdown',
            'sh': 'shellscript',
            'bash': 'shellscript',
            'zsh': 'shellscript',
            'fish': 'shellscript',
            'ps1': 'powershell',
            'sql': 'sql',
            'dockerfile': 'dockerfile',
            'makefile': 'makefile',
            'gitignore': 'ignore',
            'txt': 'plaintext'
        };

        return languageMap[extension.toLowerCase()] || 'plaintext';
    }
}