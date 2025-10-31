# VSCode插件运行和打包指南

## 环境准备

### 1. 安装Node.js和npm
```bash
# Ubuntu/Debian系统
sudo apt update
sudo apt install nodejs npm

# 或者使用NodeSource仓库安装最新版本
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装VSCode扩展开发工具
```bash
# 全局安装vsce (Visual Studio Code Extension manager)
npm install -g vsce

# 全局安装TypeScript编译器
npm install -g typescript
```

## 开发和测试

### 1. 安装项目依赖
```bash
cd git-history-viewer
npm install
```

### 2. 编译TypeScript代码
```bash
# 一次性编译
npm run compile

# 或者监听模式（自动重新编译）
npm run watch
```

### 3. 在VSCode中调试运行
1. 用VSCode打开插件项目文件夹
2. 按 `F5` 或点击 "Run and Debug" 
3. 选择 "Run Extension" 
4. 会打开一个新的VSCode窗口（Extension Development Host）
5. 在新窗口中打开一个Git仓库进行测试

### 4. 测试插件功能
在Extension Development Host窗口中：
1. 打开一个Git仓库中的文件
2. 选中某一行，右键选择 "显示行修改历史"
3. 或者右键选择 "显示文件修改历史"
4. 也可以通过命令面板（Ctrl+Shift+P）搜索 "Git History" 命令

## 打包和发布

### 1. 打包成VSIX文件
```bash
# 确保代码已编译
npm run compile

# 打包插件
vsce package

# 会生成 git-history-viewer-0.0.1.vsix 文件
```

### 2. 本地安装VSIX文件
```bash
# 方法1: 使用命令行安装
code --install-extension git-history-viewer-0.0.1.vsix

# 方法2: 在VSCode中安装
# 1. 打开VSCode
# 2. 按 Ctrl+Shift+P 打开命令面板
# 3. 输入 "Extensions: Install from VSIX"
# 4. 选择生成的 .vsix 文件
```

### 3. 发布到VSCode市场（可选）
```bash
# 首先需要创建Azure DevOps账户和Personal Access Token
# 然后登录
vsce login <publisher-name>

# 发布插件
vsce publish
```

## 开发配置文件

### launch.json (VSCode调试配置)
创建 `.vscode/launch.json`：
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run Extension",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}"
            ],
            "outFiles": [
                "${workspaceFolder}/out/**/*.js"
            ],
            "preLaunchTask": "${workspaceFolder}/npm: compile"
        }
    ]
}
```

### tasks.json (VSCode任务配置)
创建 `.vscode/tasks.json`：
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "npm",
            "script": "compile",
            "group": "build",
            "presentation": {
                "panel": "shared"
            },
            "problemMatcher": "$tsc"
        },
        {
            "type": "npm",
            "script": "watch",
            "group": "build",
            "presentation": {
                "panel": "shared"
            },
            "problemMatcher": "$tsc-watch"
        }
    ]
}
```

## 常见问题

### 1. 编译错误
- 确保安装了TypeScript: `npm install -g typescript`
- 检查tsconfig.json配置是否正确

### 2. 插件无法加载
- 确保package.json中的activationEvents配置正确
- 检查main字段指向的文件路径是否正确

### 3. Git命令失败
- 确保系统已安装Git
- 确保当前工作区是Git仓库
- 检查文件路径是否正确

### 4. 打包失败
- 确保所有依赖都已安装
- 确保代码已成功编译到out目录
- 检查package.json配置是否完整

## 快速开始脚本

创建一个快速启动脚本 `start.sh`：
```bash
#!/bin/bash
echo "安装依赖..."
npm install

echo "编译代码..."
npm run compile

echo "启动开发环境..."
echo "请在VSCode中按F5启动调试"
```

使用方法：
```bash
chmod +x start.sh
./start.sh
```