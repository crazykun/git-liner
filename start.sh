#!/bin/bash

# Git Liner - 开发工具脚本
# 整合了开发、打包、安装和发布功能

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 未安装"
        return 1
    fi
    return 0
}

# 获取版本号
get_version() {
    node -p "require('./package.json').version" 2>/dev/null || echo "unknown"
}

# 获取最新的VSIX文件
get_latest_vsix() {
    ls -t *.vsix 2>/dev/null | head -n1
}

# 开发环境初始化
setup_dev() {
    print_header "🚀 Git Liner 开发环境初始化"
    
    # 检查必要工具
    if ! check_command node; then
        print_error "请先安装 Node.js"
        print_info "Ubuntu/Debian: sudo apt install nodejs npm"
        exit 1
    fi
    
    if ! check_command npm; then
        print_error "请先安装 npm"
        print_info "Ubuntu/Debian: sudo apt install npm"
        exit 1
    fi
    
    print_success "Node.js 版本: $(node --version)"
    print_success "npm 版本: $(npm --version)"
    
    # 安装依赖
    print_info "安装项目依赖..."
    npm install
    
    # 编译代码
    print_info "编译 TypeScript 代码..."
    npm run compile
    
    print_success "开发环境初始化完成！"
    echo ""
    print_info "接下来的步骤："
    echo "1. 在 VSCode 中打开此项目文件夹"
    echo "2. 按 F5 启动调试（或点击 Run and Debug）"
    echo "3. 在新打开的 VSCode 窗口中测试插件"
    echo ""
    print_info "开发命令："
    echo "  npm run compile  - 编译代码"
    echo "  npm run watch    - 监听模式编译"
    echo "  ./scripts.sh package - 打包插件"
}

# 打包插件
package_extension() {
    print_header "📦 Git Liner 插件打包"
    
    # 检查vsce是否安装
    if ! check_command vsce; then
        print_warning "vsce 未安装，正在安装..."
        npm install -g vsce
    fi
    
    # 编译代码
    print_info "编译代码..."
    npm run compile
    
    # 打包插件
    print_info "打包插件..."
    vsce package --allow-star-activation
    
    # 获取生成的文件信息
    local vsix_file=$(get_latest_vsix)
    if [ -n "$vsix_file" ]; then
        print_success "打包成功！"
        print_info "生成的文件: $vsix_file"
        print_info "文件大小: $(du -h "$vsix_file" | cut -f1)"
        echo ""
        print_info "安装插件："
        echo "  ./scripts.sh install"
        echo "  或者: code --install-extension $vsix_file"
        echo ""
        print_info "在VSCode中安装："
        echo "  Ctrl+Shift+P → Extensions: Install from VSIX → 选择.vsix文件"
    else
        print_error "未找到生成的VSIX文件"
        exit 1
    fi
}

# 安装插件
install_extension() {
    print_header "📦 Git Liner 插件安装"
    
    # 查找最新的VSIX文件
    local vsix_file=$(get_latest_vsix)
    
    if [ -z "$vsix_file" ]; then
        print_error "未找到VSIX文件，请先运行打包："
        print_info "  ./scripts.sh package"
        exit 1
    fi
    
    print_info "找到插件文件: $vsix_file"
    
    # 检查VSCode是否安装
    if ! check_command code; then
        print_error "VSCode 未安装或不在PATH中"
        print_info "请确保VSCode已安装并添加到PATH"
        exit 1
    fi
    
    # 安装插件
    print_info "正在安装插件..."
    code --install-extension "$vsix_file"
    
    print_success "插件安装成功！"
    echo ""
    print_info "使用方法："
    echo "  1. 在VSCode中打开一个Git仓库"
    echo "  2. 打开任意文件"
    echo "  3. 右键选择 '显示文件修改历史' 或 '显示行修改历史'"
    echo "  4. 点击提交查看详细差异"
    echo ""
    print_info "提示："
    echo "  - 确保当前工作区是Git仓库"
    echo "  - 文件必须已提交到Git才能查看历史"
}

# 发布到VSCode Marketplace
publish_vscode() {
    print_header "🚀 发布 Git Liner 到 VSCode Marketplace"
    
    # 检查是否安装了vsce
    if ! check_command vsce; then
        print_warning "vsce 未安装，正在安装..."
        npm install -g vsce
    fi
    
    # 编译代码
    print_info "编译代码..."
    npm run compile
    
    print_info "发布到 VSCode Marketplace..."
    
    # 发布到VSCode Marketplace
    if [ -n "$VSCE_PAT" ]; then
        vsce publish -p "$VSCE_PAT"
    else
        print_warning "请设置 VSCE_PAT 环境变量或确保已登录"
        print_info "如果未登录，请先运行: vsce login <publisher-name>"
        vsce publish
    fi
    
    print_success "发布成功！"
    print_info "查看插件: https://marketplace.visualstudio.com/items?itemName=crazykun.git-liner"
}

# 发布到Open VSX Registry
publish_openvsx() {
    print_header "🚀 发布 Git Liner 到 Open VSX Registry"
    
    # 检查是否安装了ovsx
    if ! check_command ovsx; then
        print_warning "ovsx 未安装，正在安装..."
        npm install -g ovsx
    fi
    
    # 编译代码
    print_info "编译代码..."
    npm run compile
    
    # 打包插件
    print_info "打包插件..."
    npx vsce package
    
    # 获取版本号和包文件
    local version=$(get_version)
    local package_file="git-liner-${version}.vsix"
    
    # 检查包文件是否存在
    if [ ! -f "$package_file" ]; then
        print_error "包文件 $package_file 不存在"
        exit 1
    fi
    
    print_info "发布到 Open VSX Registry..."
    
    # 发布到Open VSX
    if [ -n "$OVSX_PAT" ]; then
        ovsx publish "$package_file" -p "$OVSX_PAT"
    else
        print_warning "请设置 OVSX_PAT 环境变量或手动输入访问令牌"
        ovsx publish "$package_file"
    fi
    
    print_success "发布成功！"
    print_info "查看插件: https://open-vsx.org/extension/crazykun/git-liner"
}

# 发布到所有平台
publish_all() {
    print_header "🚀 发布 Git Liner 到所有平台"
    
    print_info "开始发布到 VSCode Marketplace..."
    publish_vscode
    
    echo ""
    print_info "开始发布到 Open VSX Registry..."
    publish_openvsx
    
    print_success "所有平台发布完成！"
}

# 清理构建文件
clean() {
    print_header "🧹 清理构建文件"
    
    print_info "清理编译输出..."
    rm -rf out/
    
    print_info "清理VSIX文件..."
    rm -f *.vsix
    
    print_info "清理node_modules（可选）..."
    read -p "是否删除 node_modules？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf node_modules/
        print_info "已删除 node_modules"
    fi
    
    print_success "清理完成！"
}

# 显示帮助信息
show_help() {
    echo "Git Liner - 开发工具脚本"
    echo ""
    echo "用法: ./dev.sh <命令>"
    echo ""
    echo "命令:"
    echo "  setup        初始化开发环境（安装依赖、编译代码）"
    echo "  package      打包插件为VSIX文件"
    echo "  install      安装最新的VSIX插件到VSCode"
    echo "  publish      发布插件到Open VSX Registry"
    echo "  publish-vsc  发布插件到VSCode Marketplace"
    echo "  publish-all  发布插件到所有平台"
    echo "  clean        清理构建文件和缓存"
    echo "  help         显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./dev.sh setup        # 初始化开发环境"
    echo "  ./dev.sh package      # 打包插件"
    echo "  ./dev.sh install      # 安装插件"
    echo "  ./dev.sh publish      # 发布到Open VSX"
    echo "  ./dev.sh publish-vsc  # 发布到VSCode Marketplace"
    echo "  ./dev.sh publish-all  # 发布到所有平台"
    echo ""
    echo "环境变量:"
    echo "  VSCE_PAT  VSCode Marketplace 访问令牌"
    echo "  OVSX_PAT  Open VSX Registry 访问令牌"
}

# 主函数
main() {
    case "${1:-help}" in
        "setup"|"dev"|"start")
            setup_dev
            ;;
        "package"|"build")
            package_extension
            ;;
        "install")
            install_extension
            ;;
        "publish"|"publish-ovsx")
            publish_openvsx
            ;;
        "publish-vsc"|"publish-vscode")
            publish_vscode
            ;;
        "publish-all"|"publish-both")
            publish_all
            ;;
        "clean")
            clean
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"