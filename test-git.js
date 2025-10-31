const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testGitCommands() {
    try {
        console.log('测试Git命令...');
        
        // 测试git log
        const { stdout: logOutput } = await execAsync('git log --pretty=format:"%H|%an|%ad|%s" --date=short -n 3');
        console.log('Git log 输出:');
        console.log(logOutput);
        
        if (logOutput.trim()) {
            const lines = logOutput.split('\n');
            const [hash, author, date, message] = lines[0].split('|');
            console.log(`\n最新提交: ${hash.substring(0, 8)} by ${author}`);
            
            // 测试git show
            const { stdout: showOutput } = await execAsync(`git show --pretty=format:"提交: %H%n作者: %an%n日期: %ad%n%n%s" --date=local --no-patch ${hash}`);
            console.log('\nGit show 输出:');
            console.log(showOutput);
        }
        
    } catch (error) {
        console.error('Git命令测试失败:', error.message);
    }
}

testGitCommands();