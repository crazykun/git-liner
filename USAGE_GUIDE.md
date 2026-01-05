# Git Liner 使用指南

## 📖 详细使用说明

### 🎯 基本概念

Git Liner 是一个专注于 Git 历史追踪的 VSCode 插件，主要提供两种历史查看模式：

1. **文件历史** - 查看整个文件的提交历史
2. **行历史** - 查看特定代码行的修改历史

### 🚀 快速上手

#### 第一步：确保环境准备就绪
- ✅ VSCode 1.75.0 或更高版本
- ✅ Git 已安装并配置
- ✅ 当前项目是 Git 仓库
- ✅ 文件已提交到 Git

#### 第二步：安装插件
1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "Git Liner"
4. 点击安装

#### 第三步：开始使用
1. 打开任意已提交的文件
2. 右键选择相应的历史查看选项
3. 在侧边栏查看历史记录

## 📋 功能详解

### 1. 文件历史查看

**启动方式：**
- 右键菜单：`显示文件修改历史`
- 快捷键：`Ctrl+Alt+H` (Windows/Linux) 或 `Cmd+Alt+H` (macOS)
- 命令面板：`Git Liner: Show File History`

**功能特点：**
- 📅 按时间倒序显示所有提交
- 📊 显示每次提交的变更统计
- 🔄 支持文件重命名追踪（`--follow`）
- ⚡ 分页加载，首次显示 20 条记录
- 🔄 "加载更多" 按钮获取历史记录

**显示信息：**
```
📄 [abc1234] 2025-01-05 张三
    feat: 添加用户登录功能
    📊 +25 -3 lines
```

### 2. 行历史查看

**启动方式：**
- 选中代码行 → 右键菜单：`显示行修改历史`
- 快捷键：`Ctrl+Alt+L` (Windows/Linux) 或 `Cmd+Alt+L` (macOS)
- 命令面板：`Git Liner: Show Line History`

**功能特点：**
- 🎯 精确追踪单行代码的变更历史
- 🔍 使用 `git log -L` 智能追踪行变化
- 📝 即使代码重构也能准确追踪
- 🔄 支持跨提交的行号变化

**显示信息：**
```
📝 [def5678] 2025-01-04 李四
    fix: 修复登录验证逻辑
    行 42: validateUser(username, password)
```

### 3. 差异查看

**查看文件差异：**
- 点击提交记录旁的 📄 图标
- 在 VSCode 内置差异编辑器中显示
- 左侧：修改前版本
- 右侧：修改后版本

**查看行级差异：**
- 点击行历史记录旁的 📝 图标
- 自动定位到相关代码行
- 高亮显示具体变更

### 4. 辅助功能

**复制提交哈希：**
- 点击 📋 图标复制完整的提交哈希值
- 用于 Git 命令行操作或代码审查

**刷新历史：**
- 点击 🔄 图标刷新当前历史记录
- 自动检测文件变更并更新

## ⚙️ 高级配置

### 自定义设置

在 VSCode 设置中搜索 "Git Liner" 或直接编辑 `settings.json`：

```json
{
  // 每页显示的提交数量
  "gitLiner.pageSize": 20,
  
  // 历史记录缓存时间（毫秒）
  "gitLiner.cacheTimeout": 30000,
  
  // 是否显示状态栏信息
  "gitLiner.showStatusBar": false,
  
  // 文件变更时是否自动刷新
  "gitLiner.autoRefresh": true
}
```

### 性能优化建议

**大型仓库优化：**
- 减少 `pageSize` 到 10-15
- 增加 `cacheTimeout` 到 60000ms
- 关闭 `autoRefresh` 减少自动刷新

**小型仓库优化：**
- 增加 `pageSize` 到 30-50
- 减少 `cacheTimeout` 到 15000ms
- 开启 `autoRefresh` 获得实时更新

## 🔧 使用技巧

### 1. 多根工作区支持

Git Liner 完美支持 VSCode 多根工作区：

```json
// .code-workspace 文件示例
{
  "folders": [
    { "name": "Frontend", "path": "./frontend" },
    { "name": "Backend", "path": "./backend" },
    { "name": "Shared", "path": "./shared" }
  ]
}
```

- 自动识别文件所属的 Git 仓库
- 正确处理不同根目录的文件路径
- 支持跨仓库的历史查看

### 2. 键盘快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Ctrl+Alt+H` | 文件历史 | 查看当前文件的完整提交历史 |
| `Ctrl+Alt+L` | 行历史 | 查看选中行的修改历史 |
| `F5` | 刷新 | 刷新当前历史记录 |
| `Escape` | 关闭 | 关闭差异查看器 |

### 3. 工作流集成

**代码审查工作流：**
1. 选中可疑代码行
2. 查看行历史找到引入问题的提交
3. 复制提交哈希进行详细分析
4. 在差异视图中理解变更上下文

**Bug 调试工作流：**
1. 定位到出问题的代码
2. 查看文件历史了解最近变更
3. 对比不同版本找出问题根源
4. 追踪相关代码的演变过程

**学习代码工作流：**
1. 查看核心文件的历史演变
2. 理解功能是如何逐步实现的
3. 学习代码重构的最佳实践
4. 了解项目的开发历程

## 🔍 故障排除

### 常见问题解决

#### 问题 1：显示"不在 Git 仓库中"
```bash
# 检查当前目录是否为 Git 仓库
git status

# 如果不是，初始化 Git 仓库
git init

# 或者切换到正确的 Git 仓库目录
cd /path/to/your/git/repo
```

#### 问题 2：显示"未找到历史记录"
```bash
# 检查文件是否被 Git 跟踪
git log --oneline -- "文件路径"

# 如果文件未提交，先添加并提交
git add "文件路径"
git commit -m "Add file to Git"
```

#### 问题 3：性能问题
- 减少 `pageSize` 配置值
- 检查仓库大小和网络连接
- 确保使用本地 Git 仓库而非远程

#### 问题 4：多根工作区问题
- 确保使用 Git Liner v1.0.6+
- 重启 VSCode 重新加载插件
- 检查工作区配置文件

### 调试模式

启用详细日志：
1. 打开 VSCode 开发者工具：`Help` → `Toggle Developer Tools`
2. 切换到 Console 标签
3. 查找 `[Git Liner]` 开头的日志信息

### 获取支持

如果问题仍未解决：
1. 查看 [GitHub Issues](https://github.com/crazykun/git-liner/issues)
2. 搜索类似问题或创建新 Issue
3. 提供详细的环境信息和错误日志

## 📊 最佳实践

### 1. 性能最佳实践
- 对于大型仓库，使用较小的 `pageSize`
- 定期清理 Git 仓库以提高性能
- 避免在网络较慢时查看远程仓库历史

### 2. 工作流最佳实践
- 结合 Git 命令行工具使用
- 定期提交代码以获得更好的历史追踪
- 使用有意义的提交信息

### 3. 团队协作最佳实践
- 统一团队的 Git 工作流
- 使用分支策略管理代码变更
- 定期进行代码审查

## 🎯 进阶用法

### 与其他工具集成

**与 GitLens 配合使用：**
- Git Liner 专注于历史查看
- GitLens 提供更多 Git 功能
- 两者可以互补使用

**与命令行 Git 配合：**
```bash
# 使用 Git Liner 找到提交哈希
# 然后在命令行中进行详细分析
git show <commit-hash>
git diff <commit-hash>^ <commit-hash>
```

### 自定义工作流

创建自定义的 VSCode 任务来配合 Git Liner：

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Git: Show detailed commit",
      "type": "shell",
      "command": "git show ${input:commitHash}",
      "group": "build"
    }
  ],
  "inputs": [
    {
      "id": "commitHash",
      "description": "Enter commit hash",
      "default": "",
      "type": "promptString"
    }
  ]
}
```

---

希望这个详细的使用指南能帮助你更好地使用 Git Liner！如果有任何问题或建议，欢迎在 GitHub 上提出。