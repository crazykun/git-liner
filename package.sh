#!/bin/bash

echo "📦 VSCode插件打包脚本"
echo "===================="

# 检查vsce是否安装
if ! command -v vsce &> /dev/null; then
    echo "❌ vsce 未安装，正在安装..."
    npm install -g vsce
    if [ $? -ne 0 ]; then
        echo "❌ vsce 安装失败"
        exit 1
    fi
fi

# 编译代码
echo "🔨 编译代码..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

# 打包插件
echo "📦 打包插件..."
vsce package

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 打包成功！"
    echo "📁 生成的文件: git-history-viewer-0.0.1.vsix"
    echo ""
    echo "🚀 安装插件："
    echo "  code --install-extension git-history-viewer-0.0.1.vsix"
    echo ""
    echo "或者在VSCode中："
    echo "  Ctrl+Shift+P → Extensions: Install from VSIX → 选择.vsix文件"
else
    echo "❌ 打包失败"
    exit 1
fi