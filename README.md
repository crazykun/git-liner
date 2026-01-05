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
    <a href="https://github.com/crazykun/git-liner/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/crazykun/git-liner?style=flat-square" alt="License">
    </a>
  </p>
</div>

## 🎯 为什么选择 Git Liner？

如果你觉得 GitLens 太花哨、占用状态栏，或者你只是想要一个**专注于历史追踪**的轻量级工具，Git Liner 是你的理想选择：

- ✅ **极简设计**: 不占用状态栏，界面清爽，专注核心功能
- ✅ **性能优异**: 分页加载技术，1-2秒即时响应，告别漫长等待
- ✅ **内存友好**: 渐进式加载，低资源占用，不影响编辑器性能
- ✅ **零学习成本**: 右键即用，立即上手，无需复杂配置
- ✅ **多根工作区**: 完美支持 VSCode 多根工作区环境
- ✅ **跨平台兼容**: Windows、macOS、Linux 全平台支持

## ✨ 功能特性

### 🔍 精确的行级历史追踪
- **智能行追踪**: 使用 `git log -L` 精确追踪代码行的变更历史
- **跨重构追踪**: 即使代码重构、移动，也能准确追踪行的演变
- **上下文感知**: 自动定位到相关代码行，提供完整的变更上下文

### 📁 完整的文件历史视图
- **时间线视图**: 按时间顺序展示文件的完整提交历史
- **变更统计**: 显示每次提交的增删行数统计
- **重命名追踪**: 使用 `--follow` 参数追踪文件重命名历史

### ⚡ 高性能分页加载
- **首屏秒开**: 首次加载仅显示20条记录，1-2秒内完成
- **按需加载**: "加载更多"按钮，用户主导加载节奏
- **内存优化**: 渐进式加载，避免大仓库内存溢出

### 🎯 直观的用户界面
- **右键菜单**: 编辑器右键快速访问，符合使用习惯
- **侧边栏视图**: 专用的 Git Liner 侧边栏，信息一目了然
- **差异对比**: 内置差异查看器，直观显示代码变更
- **快捷键支持**: `Ctrl+Alt+H` (文件历史) 和 `Ctrl+Alt+L` (行历史)

## 🚀 快速开始

### 安装方式

#### 方式一：VSCode 插件市场（推荐）
1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开插件市场
3. 搜索 "Git Liner"
4. 点击安装

#### 方式二：命令行安装
```bash
code --install-extension crazykun.git-liner
```

#### 方式三：离线安装
1. 从 [Releases](https://github.com/crazykun/git-liner/releases) 下载 `.vsix` 文件
2. VSCode 中按 `Ctrl+Shift+P`
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的 `.vsix` 文件

### 首次使用
1. **打开 Git 仓库**: 确保你的项目是一个 Git 仓库
2. **打开文件**: 在编辑器中打开任意已提交的文件
3. **右键查看**: 右键选择"显示文件修改历史"
4. **享受速度**: 1-2秒内看到历史记录

## 📖 详细使用指南

### 查看文件历史

#### 方法一：右键菜单
1. 在编辑器中打开文件
2. 右键选择 **"显示文件修改历史"**
3. 在侧边栏查看提交列表
4. 点击任意提交查看详细差异

#### 方法二：快捷键
- 按 `Ctrl+Alt+H` (Windows/Linux) 或 `Cmd+Alt+H` (macOS)

#### 方法三：命令面板
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Git Liner: Show File History"
3. 回车执行

### 查看行历史

#### 方法一：选中行后右键
1. 在编辑器中选中要查看的代码行
2. 右键选择 **"显示行修改历史"**
3. 查看该行的完整变更历史

#### 方法二：快捷键
- 选中代码行后按 `Ctrl+Alt+L` (Windows/Linux) 或 `Cmd+Alt+L` (macOS)

### 查看提交差异
- **文件差异**: 点击提交记录旁的 📄 图标
- **行级差异**: 点击行历史记录旁的 📝 图标
- **复制哈希**: 点击 📋 图标复制提交哈希值

### 分页加载
- **自动加载**: 首次显示最新的 20 条记录
- **加载更多**: 点击列表底部的 "加载更多..." 按钮
- **性能优化**: 大型仓库也能快速响应

## ⚙️ 配置选项

Git Liner 提供了灵活的配置选项，可在 VSCode 设置中调整：

### 基本设置

```json
{
  // 每页加载的提交数量 (5-100)
  "gitLiner.pageSize": 20,
  
  // 缓存超时时间 (毫秒)
  "gitLiner.cacheTimeout": 30000,
  
  // 是否显示状态栏信息
  "gitLiner.showStatusBar": false,
  
  // 是否自动刷新历史
  "gitLiner.autoRefresh": true
}
```

### 配置说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `pageSize` | 20 | 每次加载的提交数量，范围 5-100 |
| `cacheTimeout` | 30000 | 历史记录缓存时间（毫秒） |
| `showStatusBar` | false | 是否在状态栏显示当前文件信息 |
| `autoRefresh` | true | 文件变更时是否自动刷新历史 |

## 🔧 系统要求

### 最低要求
- **VSCode**: 1.75.0 或更高版本
- **Git**: 2.0 或更高版本
- **操作系统**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)

### 推荐配置
- **VSCode**: 最新稳定版
- **Git**: 2.30+ (支持更多高级特性)
- **内存**: 4GB+ (大型仓库推荐 8GB+)

### Git 仓库要求
- 当前工作区必须是 Git 仓库
- 文件必须已提交到 Git 才能查看历史
- 支持本地仓库和远程仓库

## 🌟 高级功能

### 多根工作区支持
Git Liner 完美支持 VSCode 的多根工作区功能：
- 自动识别文件所属的 Git 仓库
- 正确处理不同根目录下的文件路径
- 支持跨仓库的历史查看

### 文件重命名追踪
使用 Git 的 `--follow` 参数追踪文件重命名：
- 即使文件被重命名，也能查看完整历史
- 自动处理文件移动和路径变更
- 保持历史记录的连续性

### 智能缓存机制
- **内存缓存**: 最近查看的历史记录缓存在内存中
- **自动清理**: 超时自动清理缓存，避免内存泄漏
- **增量加载**: 只加载新的提交记录，避免重复请求

## 🔍 故障排除

### 常见问题

#### 1. 提示"不在 Git 仓库中"
**原因**: 当前工作区不是 Git 仓库或 Git 未正确初始化
**解决方案**:
```bash
# 检查是否为 Git 仓库
git status

# 如果不是，初始化 Git 仓库
git init

# 或者打开正确的 Git 仓库目录
```

#### 2. 显示"未找到历史记录"
**原因**: 文件未提交到 Git 或文件路径有问题
**解决方案**:
```bash
# 检查文件是否被 Git 跟踪
git log --oneline -- "文件路径"

# 如果文件未提交，先提交文件
git add "文件路径"
git commit -m "Add file"
```

#### 3. 多根工作区中无法加载历史
**原因**: 文件路径解析问题（v1.0.6 已修复）
**解决方案**:
- 确保使用 Git Liner v1.0.6 或更高版本
- 重启 VSCode 重新加载插件
- 检查工作区配置是否正确

#### 4. 性能问题或加载缓慢
**原因**: 仓库过大或网络问题
**解决方案**:
- 减少 `pageSize` 配置值
- 增加 `cacheTimeout` 以减少重复请求
- 确保 Git 仓库在本地（远程仓库会较慢）

### 调试模式

如果遇到问题，可以启用调试模式：

1. 打开 VSCode 开发者工具：`Help` → `Toggle Developer Tools`
2. 在 Console 中查看 Git Liner 的日志输出
3. 查找以 `[Git Liner]` 开头的日志信息

### 获取帮助

如果问题仍未解决，请：

1. **查看日志**: 检查 VSCode 输出面板中的错误信息
2. **提交 Issue**: 在 [GitHub Issues](https://github.com/crazykun/git-liner/issues) 中描述问题
3. **提供信息**: 包含 VSCode 版本、Git 版本、操作系统等信息

## 📊 性能对比

| 功能 | Git Liner | GitLens | 原生 Git |
|------|-----------|---------|----------|
| 首次加载速度 | 1-2秒 | 5-10秒 | 命令行 |
| 内存占用 | 低 | 高 | 无 |
| 界面复杂度 | 极简 | 复杂 | 无界面 |
| 学习成本 | 零 | 中等 | 高 |
| 多根工作区 | ✅ | ✅ | ✅ |
| 分页加载 | ✅ | ❌ | ❌ |


## 🤝 贡献指南

我们欢迎社区贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/crazykun/git-liner.git
cd git-liner

# 安装依赖
npm install

# 启动开发模式
npm run watch

# 在 VSCode 中按 F5 启动调试
```

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🙏 致谢

感谢以下项目和社区的启发：
- [GitLens](https://github.com/gitkraken/vscode-gitlens) - Git 增强功能的先驱
- [Git History](https://github.com/DonJayamanne/gitHistoryVSCode) - Git 历史查看的灵感来源
- VSCode 团队 - 提供了优秀的扩展 API

## 📞 联系我们

- **GitHub**: [crazykun/git-liner](https://github.com/crazykun/git-liner)
- **Issues**: [报告问题](https://github.com/crazykun/git-liner/issues)
- **Discussions**: [功能讨论](https://github.com/crazykun/git-liner/discussions)

---

<div align="center">
  <p>如果 Git Liner 对你有帮助，请给我们一个 ⭐ Star！</p>
  <p>让更多开发者发现这个简洁高效的 Git 历史工具。</p>
</div>


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
npm version patch    # 1.0.6 -> 1.0.7
npm version minor    # 1.0.6 -> 1.1.0  
npm version major    # 1.0.6 -> 2.0.0

# 手动更新版本号
# 编辑 package.json 中的 "version" 字段
```

### 项目结构
```
git-liner/
├── src/                    # 源代码目录
│   ├── extension.ts        # 插件入口文件
│   ├── gitHistoryProvider.ts # Git 历史数据提供者
│   ├── historyTreeProvider.ts # 历史树视图提供者
│   ├── commands.ts         # 命令处理
│   ├── i18n.ts            # 国际化支持
│   └── test/              # 测试文件
├── out/                   # 编译输出目录
├── scripts/               # 构建脚本
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
└── README.md             # 项目文档
```
## 许可证

MIT License