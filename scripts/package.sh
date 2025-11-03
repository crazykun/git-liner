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
vsce package --allow-star-activation

if [ $? -eq 0 ]; then
    # 获取生成的文件名
    VSIX_FILE=$(ls -t *.vsix | head -n1)
    echo ""
    echo "✅ 打包成功！"
    echo "📁 生成的文件: $VSIX_FILE"
    echo "📊 文件大小: $(du -h "$VSIX_FILE" | cut -f1)"
    echo ""
    echo "🚀 安装插件："
    echo "  code --install-extension $VSIX_FILE"
    echo ""
    echo "或者在VSCode中："
    echo "  Ctrl+Shift+P → Extensions: Install from VSIX → 选择.vsix文件"
    echo ""
    echo "🧪 测试插件："
    echo "  1. 在VSCode中按F5启动调试"
    echo "  2. 在新窗口中打开Git仓库"
    echo "  3. 右键文件选择'显示文件修改历史'"
else
    echo "❌ 打包失败"
    exit 1
fi