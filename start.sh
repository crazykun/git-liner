#!/bin/bash

echo "🚀 Git History Viewer 插件开发环境启动脚本"
echo "============================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    echo "Ubuntu/Debian: sudo apt install nodejs npm"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    echo "Ubuntu/Debian: sudo apt install npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 编译TypeScript
echo ""
echo "🔨 编译 TypeScript 代码..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo ""
echo "✅ 环境准备完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 在 VSCode 中打开此项目文件夹"
echo "2. 按 F5 启动调试（或点击 Run and Debug）"
echo "3. 在新打开的 VSCode 窗口中测试插件"
echo ""
echo "🔧 开发命令："
echo "  npm run compile  - 编译代码"
echo "  npm run watch    - 监听模式编译"
echo "  vsce package     - 打包插件"
echo ""
echo "📦 打包插件："
echo "  ./package.sh     - 一键打包"