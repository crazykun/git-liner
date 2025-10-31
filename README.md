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

## 设计理念

如果你觉得 GitLens 太花哨、占用状态栏，那么这个插件正是为你而生。我们推崇极简主义的Git工作流：

- **VSCode 原生 Git** - 用于日常提交、推送、拉取
- **Git Graph** - 用于查看和管理分支图谱  
- **Git Liner** - 用于深度查看某文件或代码行的历史

三者配合，既保持界面简洁，又能满足所有Git操作需求。

## 🌟 最新改进亮点

### 性能革命 - 分页加载技术
Git Liner 1.0.2 版本带来了革命性的性能提升：

| 改进项目 | 优化前 | 优化后 | 提升幅度 |
|---------|--------|--------|----------|
| **首次加载** | 5-10秒 | 1-2秒 | **80%+ 提升** |
| **大文件支持** | 容易卡顿 | 流畅操作 | **完全解决** |
| **内存占用** | 全量加载 | 按需加载 | **显著优化** |
| **用户体验** | 等待加载 | 即时响应 | **质的飞跃** |

### 🎯 核心优势
- **即时响应**: 告别漫长等待，1-2秒内显示历史记录
- **智能分页**: 首次加载20条最新记录，满足90%的查看需求
- **按需扩展**: "加载更多..."按钮，用户主导的浏览节奏
- **内存友好**: 渐进式加载，VSCode运行更流畅

## 功能特性

- 🔍 **行修改历史**: 精确查看当前选中行的Git修改历史和代码追溯
- 📁 **文件修改历史**: 查看整个文件的完整Git提交历史  
- 📊 **提交详情**: 显示每个提交的详细差异对比
- 🎯 **右键菜单**: 通过编辑器右键菜单快速访问功能
- 🚀 **智能差异显示**: 自动处理新增、删除、修改等不同类型的文件变更
- 📄 **分页加载**: 革命性性能提升，大文件历史加载速度提升80%+，1-2秒即时响应
- 🎨 **极简设计**: 不占用状态栏，不添加多余的UI元素
- ⚡ **轻量高效**: 专注核心功能，性能优异

## 与其他插件的配合

本插件与以下插件完美配合，构建极简而强大的Git工作流：

### 推荐组合
- **VSCode 原生 Git** - 处理日常的提交、推送、拉取操作
- **[Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)** - 可视化分支图谱，管理分支合并
- **[Git Liner](https://marketplace.visualstudio.com/items?itemName=crazykun.git-liner)** - 深度查看文件历史和代码行追溯

### 为什么不用 GitLens？
如果你也认为 GitLens 过于复杂，有以下困扰：
- 状态栏信息过多，干扰编码
- UI元素太花哨，影响专注度  
- 功能过于庞大，只需要基础历史查看

那么Git Liner就是你的理想选择。

## 🚀 快速开始

### 30秒上手指南
1. **安装插件**: 
   - **VS Code**: 插件市场搜索"Git Liner"
   - **VSCodium/Theia**: Open VSX搜索"Git Liner"
2. **打开文件**: 在Git仓库中打开任意代码文件
3. **右键查看**: 右键选择"显示文件修改历史"
4. **享受速度**: 1-2秒内看到历史记录，体验性能提升
5. **深度探索**: 需要更多历史时点击"加载更多..."

### 💡 最佳实践
- **日常使用**: 查看最近修改，前20条记录通常足够
- **深度调试**: 追踪bug来源时，逐步加载更多历史
- **性能优先**: 大文件建议按需加载，保持最佳体验
- **团队协作**: 快速了解代码变更历史和责任人

## 使用方法

### 查看行修改历史
1. 在编辑器中选中要查看的行
2. 右键选择 "显示行修改历史" 或使用命令面板执行 `Git History: 显示行修改历史`
3. 在弹出的列表中选择提交查看详细差异

### 查看文件修改历史  
1. 打开要查看历史的文件
2. 右键选择 "显示文件修改历史" 或使用命令面板执行 `Git History: 显示文件修改历史`
3. **快速响应**: 立即显示前20条最新提交记录（1-2秒内完成）
4. 在列表中选择提交查看详细差异
5. **按需加载**: 需要查看更多历史时，点击底部的"加载更多..."按钮
6. **无缝体验**: 新记录自动追加到现有列表，保持浏览连续性

### 🔥 分页加载使用技巧
- **快速预览**: 前20条记录通常包含最近的重要修改
- **深度挖掘**: 点击"加载更多..."逐步探索历史演进
- **性能友好**: 只加载需要的数据，保持VSCode响应流畅
- **大文件优化**: 特别适合查看package.json、README.md等频繁修改的文件

## 安装

### 📦 插件市场安装（推荐）

#### VS Code 插件市场
适用于 **Microsoft VS Code** 用户：
- 在VSCode插件市场搜索 "Git Liner"
- 或访问：[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=crazykun.git-liner)

#### Open VSX Registry  
适用于 **VSCodium**、**Eclipse Theia**、**Gitpod** 等开源IDE用户：
- 在Open VSX搜索 "Git Liner"  
- 或访问：[Open VSX Registry](https://open-vsx.org/extension/crazykun/git-liner)

### 🔧 手动安装方式

#### 从源码安装
```bash
# 克隆仓库
git clone https://github.com/crazykun/git-liner.git
cd git-liner

# 安装依赖
npm install

# 编译TypeScript
npm run compile

# 在VSCode中按F5运行插件
```

#### 从VSIX文件安装
```bash
# 1. 下载最新的.vsix文件
# 从GitHub Releases页面下载

# 2. 在VSCode中安装
# 命令面板 → "Extensions: Install from VSIX..."
# 选择下载的.vsix文件

# 或使用命令行安装
code --install-extension git-liner-1.0.2.vsix
```

### 🌍 支持的编辑器

| 编辑器 | 安装来源 | 状态 |
|--------|----------|------|
| **VS Code** | VS Code Marketplace | ✅ 完全支持 |
| **VSCodium** | Open VSX Registry | ✅ 完全支持 |
| **Eclipse Theia** | Open VSX Registry | ✅ 完全支持 |
| **Gitpod** | Open VSX Registry | ✅ 完全支持 |
| **Code - OSS** | Open VSX Registry | ✅ 完全支持 |

## 📦 开发者指南

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/crazykun/git-liner.git
cd git-liner

# 安装依赖
npm install

# 编译TypeScript
npm run compile

# 开发模式（监听文件变化）
npm run watch
```

### 打包与发布
```bash
# 1. 编译代码
npm run compile

# 2. 本地打包（生成 .vsix 文件）
vsce package

# 3. 发布到VSCode插件市场
vsce publish

# 4. 发布指定版本
vsce publish 1.0.3

# 5. 发布预发布版本
vsce publish --pre-release
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

### 发布前检查清单
- [ ] 代码编译无错误 (`npm run compile`)
- [ ] 功能测试通过
- [ ] 更新 CHANGELOG.md
- [ ] 更新版本号
- [ ] 提交所有更改到Git
- [ ] 创建Git标签 (`git tag v1.0.3`)

### 常用命令
```bash
# 查看打包内容
vsce ls

# 显示插件信息
vsce show crazykun.git-liner

# 登录发布账户
vsce login crazykun

# 生成个人访问令牌后登录
vsce login <publisher-name>
```

## 要求

- VSCode 1.75.0 或更高版本
- Git 已安装并在PATH中可用
- 当前工作区必须是Git仓库

## 性能优化与改进方案

### 🚀 分页加载技术
Git Liner 采用智能分页技术，彻底解决大文件历史加载缓慢的问题：

#### 核心改进
- **首次快速加载**: 只加载前20条最新记录，加载时间从 5-10秒 缩短至 1-2秒
- **渐进式加载**: 点击"加载更多..."按钮逐步获取历史，每次加载20条记录
- **内存优化**: 避免一次性加载大量数据，减少内存占用和卡顿现象
- **智能显示**: 只在确实还有更多记录时才显示"加载更多"按钮

#### 技术实现
```
传统方式: 一次性加载所有历史 → 慢速加载，高内存占用
Git Liner: 分页加载 → 快速响应，低内存占用

大文件性能对比:
├── 优化前: 1000+提交 → 5-10秒加载时间
└── 优化后: 首次20条 → 1-2秒加载时间
```

#### 适用场景
- **大型项目**: 有数百上千次提交的文件
- **核心文件**: 如 package.json、main.js 等频繁修改的文件  
- **长期项目**: 开发时间较长，历史记录丰富的项目
- **团队协作**: 多人协作，提交记录密集的文件

### 🎯 智能加载策略
- **优先级加载**: 最新的提交记录优先显示，符合开发者查看习惯
- **按需获取**: 用户主导的加载节奏，避免不必要的数据传输
- **缓存机制**: 已加载的数据智能缓存，切换文件时快速响应
- **错误恢复**: 网络异常或Git错误时的优雅降级处理

### 📊 性能数据对比

| 场景 | 优化前 | 优化后 | 改进幅度 |
|------|--------|--------|----------|
| 首次加载 | 5-10秒 | 1-2秒 | **80%+ 提升** |
| 内存占用 | 全量加载 | 渐进式 | **显著减少** |
| 用户体验 | 等待加载 | 即时响应 | **质的飞跃** |
| 大文件支持 | 容易卡顿 | 流畅操作 | **完全解决** |

### 💡 使用建议
1. **首次使用**: 直接查看历史，享受快速加载体验
2. **深度查看**: 需要查看更多历史时，点击"加载更多..."
3. **性能最佳**: 建议在需要时才加载更多，保持最佳性能
4. **大文件友好**: 特别适合查看有大量提交历史的核心文件

## 已知问题

- 需要确保文件在Git仓库中才能查看历史

## 发布说明

### 1.0.2 - 性能革命版本 🚀
- 📄 **分页加载**: 革命性的性能提升，大文件历史加载速度提升80%+
- ⚡ **即时响应**: 首次加载时间从5-10秒缩短至1-2秒
- 🎯 **智能按需**: "加载更多..."按钮，用户主导的加载节奏
- 💾 **内存优化**: 渐进式加载，显著减少内存占用
- 🔄 **无缝体验**: 新数据自动追加，保持浏览连续性
- 🛡️ **向后兼容**: 所有原有功能完全保留，零学习成本

### 1.0.0 - 初始版本
- 🎉 初始版本发布
- ✅ 支持行修改历史查看和代码追溯
- ✅ 支持文件修改历史查看
- ✅ 支持提交差异显示
- ✅ 极简设计，不占用状态栏
- ✅ 与Git Graph完美配合

## 🎯 为什么选择 Git Liner？

### 解决的核心痛点
1. **GitLens太重**: 功能过多，界面复杂，影响专注度
2. **加载太慢**: 大文件历史查看耗时过长，影响开发效率  
3. **内存占用**: 一次性加载大量数据，导致VSCode卡顿
4. **使用复杂**: 需要学习大量功能，违背极简原则

### Git Liner的解决方案
- ✅ **极简设计**: 只保留核心功能，界面清爽
- ✅ **性能优异**: 分页加载，响应迅速
- ✅ **内存友好**: 渐进式加载，低资源占用
- ✅ **零学习成本**: 直观操作，立即上手

## 开发者

**crazykun**
- GitHub: [https://github.com/crazykun](https://github.com/crazykun)

## 许可证

MIT License

## 🤝 贡献指南

### 如何贡献
1. **Fork** 本仓库
2. **创建特性分支**: `git checkout -b feature/amazing-feature`
3. **提交更改**: `git commit -m 'Add some amazing feature'`
4. **推送分支**: `git push origin feature/amazing-feature`
5. **创建 Pull Request**

### 开发环境设置
```bash
# 1. Fork并克隆仓库
git clone https://github.com/your-username/git-liner.git
cd git-liner

# 2. 安装依赖
npm install

# 3. 开始开发
npm run watch

# 4. 测试插件
# 按 F5 在新VSCode窗口中运行插件
```

### 代码规范
- 使用 TypeScript 进行开发
- 遵循现有的代码风格
- 添加适当的注释和文档
- 确保所有功能都有错误处理

### 提交规范
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关

欢迎提交 Issue 和 Pull Request！

## 支持项目

如果你喜欢这个极简的Git历史查看插件，请：
- 给个 ⭐️ 支持一下！
- 推荐给同样追求简洁工作流的开发者
- 分享你的使用体验和建议

让我们一起构建更简洁、更专注的开发环境！