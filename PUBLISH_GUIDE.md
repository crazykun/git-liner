# 📦 VSCode插件发布指南

## 🚀 发布到VSCode插件市场

### 1. 准备工作

#### 安装发布工具
```bash
npm install -g vsce
```

#### 创建Azure DevOps账号
1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 使用Microsoft账号登录（如果没有请先注册）
3. 创建一个组织（Organization）

#### 获取Personal Access Token (PAT)
1. 在Azure DevOps中，点击右上角用户头像
2. 选择 "Personal access tokens"
3. 点击 "New Token"
4. 配置Token：
   - **Name**: `VSCode Extension Publishing`
   - **Organization**: 选择你的组织
   - **Expiration**: 建议选择1年
   - **Scopes**: 选择 "Custom defined"
   - 勾选 **Marketplace** 下的 "Acquire", "Manage", "Publish"
5. 点击 "Create" 并**立即复制保存Token**（只显示一次）

### 2. 配置发布者信息

#### 创建发布者账号
```bash
vsce create-publisher crazykun
```
按提示输入：
- **Personal Access Token**: 粘贴刚才获取的PAT
- **Display Name**: `crazykun`
- **Email**: 你的邮箱地址

#### 或者登录现有发布者
```bash
vsce login crazykun
```

### 3. 发布前检查

#### 验证package.json配置
确保以下字段正确：
- ✅ `name`: "git-history-viewer"
- ✅ `displayName`: "Git History Viewer"  
- ✅ `description`: 英文描述
- ✅ `version`: "1.0.0"
- ✅ `publisher`: "crazykun"
- ✅ `repository`: GitHub仓库地址
- ✅ `icon`: 图标路径
- ✅ `categories`: 包含 "SCM Providers"
- ✅ `keywords`: 相关关键词

#### 检查必需文件
- ✅ `README.md` - 详细的使用说明
- ✅ `CHANGELOG.md` - 版本更新日志
- ✅ `LICENSE` - 开源许可证
- ✅ `src/logo.png` - 插件图标

#### 编译和测试
```bash
# 编译代码
npm run compile

# 本地打包测试
vsce package

# 测试安装
code --install-extension git-history-viewer-1.0.0.vsix
```

### 4. 发布插件

#### 方法1: 直接发布
```bash
vsce publish
```

#### 方法2: 先打包再发布
```bash
# 打包
vsce package

# 发布
vsce publish --packagePath git-history-viewer-1.0.0.vsix
```

#### 发布特定版本
```bash
# 发布并自动增加版本号
vsce publish patch  # 1.0.0 -> 1.0.1
vsce publish minor  # 1.0.0 -> 1.1.0  
vsce publish major  # 1.0.0 -> 2.0.0

# 发布指定版本
vsce publish 1.0.1
```

### 5. 发布后验证

#### 检查插件市场
1. 访问 [VSCode插件市场](https://marketplace.visualstudio.com/)
2. 搜索 "Git History Viewer" 或 "crazykun"
3. 确认插件信息正确显示

#### 测试安装
```bash
# 从市场安装
code --install-extension crazykun.git-history-viewer
```

### 6. 更新插件

#### 修改代码后重新发布
```bash
# 更新版本号并发布
vsce publish patch

# 或手动修改package.json中的version，然后
vsce publish
```

### 7. 管理插件

#### 查看已发布的插件
```bash
vsce ls
```

#### 取消发布（谨慎使用）
```bash
vsce unpublish crazykun.git-history-viewer
```

## 🔧 常见问题解决

### 问题1: "Publisher not found"
**解决**: 确保已正确创建并登录发布者账号
```bash
vsce create-publisher crazykun
vsce login crazykun
```

### 问题2: "Personal Access Token is invalid"
**解决**: 重新生成PAT，确保权限包含Marketplace的所有选项

### 问题3: "Icon not found"
**解决**: 确保图标文件存在且路径正确
```bash
ls -la src/logo.png
```

### 问题4: 发布后插件不显示
**解决**: 
- 等待5-10分钟，市场需要时间同步
- 检查插件是否通过了自动审核
- 查看Azure DevOps中的发布日志

## 📊 发布成功检查清单

- [ ] Azure DevOps账号已创建
- [ ] Personal Access Token已获取并配置
- [ ] 发布者账号已创建并登录
- [ ] package.json配置完整
- [ ] README.md内容详细
- [ ] CHANGELOG.md已更新
- [ ] LICENSE文件已添加
- [ ] 插件图标已准备
- [ ] 代码已编译无错误
- [ ] 本地测试通过
- [ ] 执行 `vsce publish` 成功
- [ ] 插件市场中可以搜索到
- [ ] 可以正常安装和使用

## 🎉 发布完成！

恭喜！你的VSCode插件已成功发布到插件市场。现在全世界的开发者都可以搜索、安装和使用你的插件了！

### 下一步建议：
1. 🌟 在GitHub上添加插件市场的徽章
2. 📢 在社交媒体上宣传你的插件
3. 📝 收集用户反馈并持续改进
4. 🔄 定期更新和维护插件