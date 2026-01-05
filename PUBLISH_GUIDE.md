# Git Liner 发布指南

## 📦 当前状态
- ✅ 版本已更新到 1.0.6
- ✅ 更新日志已更新
- ✅ 插件已打包：`git-liner-1.0.6.vsix`
- ✅ 发布工具已安装（vsce, ovsx）

## 🔑 获取发布令牌

### VSCode Marketplace (VSCE_PAT)
1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 登录你的 Microsoft 账户
3. 创建个人访问令牌 (Personal Access Token)
   - 组织：选择 "All accessible organizations"
   - 范围：选择 "Marketplace" → "Manage"
4. 复制生成的令牌

### Open VSX Registry (OVSX_PAT)
1. 访问 [Open VSX Registry](https://open-vsx.org/)
2. 使用 GitHub 账户登录
3. 进入用户设置 → Access Tokens
4. 创建新的访问令牌
5. 复制生成的令牌

## 🚀 发布步骤

### 方法一：使用环境变量（推荐）
```bash
# 设置令牌
export VSCE_PAT="your-vscode-marketplace-token"
export OVSX_PAT="your-openvsx-registry-token"

# 发布到所有平台
./start.sh publish-all
```

### 方法二：分别发布
```bash
# 发布到 VSCode Marketplace
export VSCE_PAT="your-vscode-marketplace-token"
./start.sh publish-vsc

# 发布到 Open VSX Registry  
export OVSX_PAT="your-openvsx-registry-token"
./start.sh publish
```

### 方法三：手动发布
```bash
# VSCode Marketplace
vsce publish -p "your-vscode-marketplace-token"

# Open VSX Registry
ovsx publish git-liner-1.0.6.vsix -p "your-openvsx-registry-token"
```

## 📋 发布检查清单

### 发布前检查
- [x] 代码已编译无错误
- [x] 版本号已更新 (1.0.6)
- [x] 更新日志已更新
- [x] 插件已打包
- [ ] 获取 VSCode Marketplace 令牌
- [ ] 获取 Open VSX Registry 令牌

### 发布后验证
- [ ] 检查 [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=crazykun.git-liner) 上的版本
- [ ] 检查 [Open VSX Registry](https://open-vsx.org/extension/crazykun/git-liner) 上的版本
- [ ] 测试从市场安装插件
- [ ] 验证多根工作区修复是否生效

## 🔧 本次更新内容 (v1.0.6)

### 主要修复
- 🔧 **多根工作区支持**：修复了在 VSCode 多根工作区环境下无法加载文件历史的问题
- 🛠️ **路径处理优化**：改进了文件路径计算逻辑
- ⚡ **Git 命令修复**：解决"有歧义的参数"错误
- 🔍 **错误处理增强**：提供更清晰的错误信息

### 技术改进
- 新增多根工作区路径处理方法
- 增强 Git 仓库状态检查
- 支持跨平台路径分隔符
- 优化中文错误提示

## 📞 需要帮助？

如果你需要帮助获取令牌或遇到发布问题，请告诉我：
1. 你的 Microsoft/GitHub 账户状态
2. 遇到的具体错误信息
3. 是否需要我协助设置发布流程

## 🎯 快速发布命令

一旦你获得了令牌，运行以下命令即可发布：

```bash
# 设置令牌（替换为你的实际令牌）
export VSCE_PAT="your-actual-vscode-token"
export OVSX_PAT="your-actual-openvsx-token"

# 一键发布到所有平台
./start.sh publish-all
```