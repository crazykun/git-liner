#!/bin/bash

echo "🚀 Git History Viewer 插件安装脚本"
echo "=================================="

# 查找最新的VSIX文件
VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ 未找到VSIX文件，请先运行打包："
    echo "  ./package.sh"
    exit 1
fi

echo "📁 找到插件文件: $VSIX_FILE"

# 检查VSCode是否安装
if ! command -v code &> /dev/null; then
    echo "❌ VSCode 未安装或不在PATH中"
    echo "请确保VSCode已安装并添加到PATH"
    exit 1
fi

# 安装插件
echo "📦 正在安装插件..."
code --install-extension "$VSIX_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 插件安装成功！"
    echo ""
    echo "🎯 使用方法："
    echo "  1. 在VSCode中打开一个Git仓库"
    echo "  2. 打开任意文件"
    echo "  3. 右键选择 '显示文件修改历史' 或 '显示行修改历史'"
    echo "  4. 点击提交查看详细差异"
    echo ""
    echo "💡 提示："
    echo "  - 确保当前工作区是Git仓库"
    echo "  - 文件必须已提交到Git才能查看历史"
else
    echo "❌ 插件安装失败"
    exit 1
fi