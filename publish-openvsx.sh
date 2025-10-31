#!/bin/bash

# Git Liner - Open VSX Registry 发布脚本

echo "🚀 开始发布 Git Liner 到 Open VSX Registry..."

# 检查是否安装了ovsx
if ! command -v ovsx &> /dev/null; then
    echo "❌ ovsx 未安装，正在安装..."
    npm install -g ovsx
fi

# 编译代码
echo "📦 编译代码..."
npm run compile

# 打包插件
echo "📦 打包插件..."
npx vsce package

# 获取版本号
VERSION=$(node -p "require('./package.json').version")
PACKAGE_FILE="git-liner-${VERSION}.vsix"

# 检查包文件是否存在
if [ ! -f "$PACKAGE_FILE" ]; then
    echo "❌ 包文件 $PACKAGE_FILE 不存在"
    exit 1
fi

echo "📤 发布到 Open VSX Registry..."

# 发布到Open VSX
if [ -n "$OVSX_PAT" ]; then
    ovsx publish "$PACKAGE_FILE" -p "$OVSX_PAT"
else
    echo "⚠️  请设置 OVSX_PAT 环境变量或手动输入访问令牌"
    ovsx publish "$PACKAGE_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ 发布成功！"
    echo "🔗 查看插件: https://open-vsx.org/extension/crazykun/git-liner"
else
    echo "❌ 发布失败"
    exit 1
fi