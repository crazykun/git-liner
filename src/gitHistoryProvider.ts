import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

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

            // 使用 git blame 获取行的修改历史
            const blameCommand = `git blame -L ${lineNumber},${lineNumber} --porcelain "${relativePath}"`;
            const { stdout: blameOutput } = await execAsync(blameCommand, { cwd });
            
            const commitHash = blameOutput.split('\n')[0].split(' ')[0];
            
            // 获取该提交的详细信息
            const logCommand = `git log --pretty=format:"%H|%an|%ad|%s" --date=short -n 10 "${relativePath}"`;
            const { stdout: logOutput } = await execAsync(logCommand, { cwd });
            
            const commits: GitCommit[] = [];
            const lines = logOutput.split('\n').filter((line: string) => line.trim());
            
            for (const line of lines) {
                const [hash, author, date, message] = line.split('|');
                commits.push({
                    hash: hash.substring(0, 8),
                    fullHash: hash,  // 保存完整hash
                    author,
                    date,
                    message
                });
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

            // 先尝试获取提交信息
            const commitInfoCommand = `git show --pretty=format:"提交: %H%n作者: %an <%ae>%n日期: %ad%n%n%s%n%n%b" --date=local --no-patch ${commitHash}`;
            const { stdout: commitInfo } = await execAsync(commitInfoCommand, { cwd });

            // 获取文件差异
            const diffCommand = `git show --pretty="" ${commitHash} -- "${relativePath}"`;
            const { stdout: diffOutput } = await execAsync(diffCommand, { cwd });

            let content = '';
            
            // 添加提交信息
            if (commitInfo.trim()) {
                content += commitInfo.trim() + '\n\n';
                content += '='.repeat(80) + '\n\n';
            }

            // 添加差异内容
            if (diffOutput && diffOutput.trim()) {
                content += diffOutput;
            } else {
                // 如果没有差异，可能是新文件或删除的文件
                const showCommand = `git show ${commitHash} --name-status -- "${relativePath}"`;
                try {
                    const { stdout: statusOutput } = await execAsync(showCommand, { cwd });
                    if (statusOutput.includes('A\t')) {
                        content += `文件在此提交中被添加\n\n`;
                        // 显示完整文件内容
                        const fullFileCommand = `git show ${commitHash}:"${relativePath}"`;
                        const { stdout: fileContent } = await execAsync(fullFileCommand, { cwd });
                        content += `+++ 新文件内容 +++\n${fileContent}`;
                    } else if (statusOutput.includes('D\t')) {
                        content += `文件在此提交中被删除`;
                    } else {
                        content += `该提交中没有找到文件 "${relativePath}" 的变更`;
                    }
                } catch {
                    content += `无法获取文件变更信息`;
                }
            }

            if (!content.trim()) {
                vscode.window.showWarningMessage('该提交中没有找到文件的变更内容');
                return;
            }

            // 创建一个新的文档来显示差异
            const doc = await vscode.workspace.openTextDocument({
                content: content,
                language: 'diff'
            });
            
            await vscode.window.showTextDocument(doc, {
                preview: false,
                viewColumn: vscode.ViewColumn.Beside
            });

        } catch (error) {
            console.error('显示提交差异错误:', error);
            vscode.window.showErrorMessage(`显示提交差异失败: ${error}`);
        }
    }
}