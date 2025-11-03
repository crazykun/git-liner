# Git Liner

<div align="center">
  <img src="https://raw.githubusercontent.com/crazykun/git-liner/refs/heads/main/src/logo_optimized.png" alt="Git Liner Logo" width="128" height="128">
  <br>
  <em>极简主义的Git行历史追踪工具，专注于精确的代码行和文件历史追溯。</em>
  
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=crazykun.git-liner">
      <img src="https://img.shields.io/visual-studio-marketplace/v/crazykun.git-liner?style=flat-square&label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="VS Code Marketplace">
    </a>
    <a href="https://open-vsx.org/extension/crazykun/git-liner">
      <img src="https://img.shields.io/open-vsx/v/crazykun/git-liner?style=flat-square&label=Open%20VSX&logo=eclipse" alt="Open VSX">
    </a>
    <a href="https://github.com/crazykun/git-liner">
      <img src="https://img.shields.io/github/stars/crazykun/git-liner?style=flat-square&logo=github" alt="GitHub Stars">
    </a>
  </p>
</div>

## 为什么选择 Git Liner？

如果你觉得 GitLens 太花哨、占用状态栏，Git Liner 是你的理想选择：

- ✅ **极简设计**: 不占用状态栏，界面清爽
- ✅ **性能优异**: 分页加载，1-2秒即时响应  
- ✅ **内存友好**: 渐进式加载，低资源占用
- ✅ **零学习成本**: 右键即用，立即上手

## 功能特性

- 🔍 **行修改历史**: 精确查看当前选中行的Git修改历史
- 📁 **文件修改历史**: 查看整个文件的完整Git提交历史  
- � **分页详加载**: 首次加载20条记录，1-2秒即时响应
- 🎯 **右键菜单**: 编辑器右键快速访问
- � **智提交详情**: 显示每个提交的详细差异对比

## 🚀 快速开始

1. **安装插件**: VS Code插件市场搜索"Git Liner"
2. **打开文件**: 在Git仓库中打开任意代码文件
3. **右键查看**: 右键选择"显示文件修改历史"
4. **享受速度**: 1-2秒内看到历史记录

## 使用方法

### 查看文件历史
1. 打开要查看历史的文件
2. 右键选择"显示文件修改历史"
3. 查看前20条最新提交记录
4. 需要更多历史时点击"加载更多..."

### 查看行历史
1. 在编辑器中选中要查看的行
2. 右键选择"显示行修改历史"
3. 在列表中选择提交查看详细差异

## 安装

### VS Code
插件市场搜索 "Git Liner" 或访问：[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=crazykun.git-liner)

### VSCodium / Eclipse Theia / Gitpod
Open VSX搜索 "Git Liner" 或访问：[Open VSX Registry](https://open-vsx.org/extension/crazykun/git-liner)

## 要求

- VSCode 1.75.0+
- Git 已安装
- 当前工作区为Git仓库

## 更新日志

### 1.0.2 🚀
- 分页加载：首次加载速度提升80%+（5-10秒 → 1-2秒）
- 内存优化：渐进式加载，减少内存占用
- 智能按需："加载更多..."按钮，用户主导加载节奏

### 1.0.0
- 初始版本发布
- 支持行/文件修改历史查看
- 极简设计，不占用状态栏


## 📦 开发者指南

### 快速开始
```bash
# 初始化开发环境（安装依赖、编译代码）
./start.sh setup

# 打包插件
./start.sh package

# 安装到本地VSCode测试
./start.sh install

# 发布到VSCode Marketplace
export VSCE_PAT="your-vscode-token"
./start.sh publish-vsc

# 发布到Open VSX Registry
export OVSX_PAT="your-ovsx-token"
./start.sh publish

# 发布到所有平台
./start.sh publish-all
```

### 开发工具脚本
我们提供了统一的开发工具脚本 `start.sh`，整合了所有开发、打包、安装和发布功能：

| 命令 | 功能 | 说明 |
|------|------|------|
| `./start.sh setup` | 开发环境初始化 | 安装依赖、编译代码 |
| `./start.sh package` | 打包插件 | 生成.vsix文件 |
| `./start.sh install` | 安装插件 | 安装到本地VSCode |
| `./start.sh publish` | 发布到Open VSX | 发布到Open VSX Registry |
| `./start.sh publish-vsc` | 发布到VSCode | 发布到VSCode Marketplace |
| `./start.sh publish-all` | 发布到所有平台 | 同时发布到两个平台 |
| `./start.sh clean` | 清理文件 | 清理构建文件和缓存 |
| `./start.sh help` | 帮助信息 | 显示所有可用命令 |

### 传统方式（仍然支持）
```bash
# 1. 编译代码
npm run compile

# 2. 本地打包（生成 .vsix 文件）
vsce package

# 3. 发布到VSCode插件市场
vsce publish

# 4. 发布到Open VSX Registry
ovsx publish git-liner-x.x.x.vsix
```

### 版本管理
```bash
# 更新版本号（自动更新package.json）
npm version patch    # 1.0.2 -> 1.0.3
npm version minor    # 1.0.2 -> 1.1.0  
npm version major    # 1.0.2 -> 2.0.0

# 手动更新版本号
# 编辑 package.json 中的 "version" 字段
```
## 许可证

MIT License