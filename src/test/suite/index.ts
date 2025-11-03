import * as path from 'path';
import * as Mocha from 'mocha';
import * as fs from 'fs';

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000,
    });

    const testsRoot = path.resolve(__dirname);

    return new Promise((resolve, reject) => {
        try {
            // 查找所有测试文件
            const testFiles = findTestFiles(testsRoot);

            if (testFiles.length === 0) {
                console.log('No test files found');
                return resolve();
            }

            // 添加测试文件
            testFiles.forEach((file) => mocha.addFile(file));

            // Run the mocha test
            mocha.run((failures) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            console.error('Error running tests:', err);
            reject(err);
        }
    });
}

function findTestFiles(dir: string): string[] {
    const files: string[] = [];

    try {
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...findTestFiles(fullPath));
            } else if (item.endsWith('.test.js')) {
                files.push(fullPath);
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${dir}:`, err);
    }

    return files;
}
