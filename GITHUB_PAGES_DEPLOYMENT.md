# GitHub Pages 部署指南

## 🚀 部署步骤

### 1. 推送代码到GitHub

确保你的代码已经推送到GitHub仓库的主分支（main或master）。

### 2. 启用GitHub Pages

1. 进入GitHub仓库页面
2. 点击 `Settings` 选项卡
3. 在左侧菜单中找到 `Pages`
4. 在 `Source` 部分选择 `GitHub Actions`

### 3. 配置仓库权限

确保GitHub Actions有正确的权限：

1. 在仓库设置中，找到 `Actions` > `General`
2. 在 `Workflow permissions` 部分选择 `Read and write permissions`
3. 勾选 `Allow GitHub Actions to create and approve pull requests`

### 4. 触发部署

推送代码到主分支后，GitHub Actions会自动构建和部署你的网站。

可以在仓库的 `Actions` 选项卡中查看部署进度。

## 🔐 访问控制功能

### 密码保护

网站包含一个密码保护系统，默认密码为：
- `your-secret-password-2024`
- `access-key-123`
- `private-site-pass`

**修改密码：**
在 `client/src/components/AccessControl.vue` 文件中修改 `validPasswords` 数组。

### 动态URL生成

1. 使用管理员账户登录网站
2. 访问URL生成器页面
3. 设置链接有效期和使用次数限制
4. 生成临时访问链接发送给特定用户

## 🛠️ 自定义配置

### 修改网站基础路径

如果你的GitHub仓库名不是 `ZGNB`，需要修改 `client/vite.config.js` 中的 `base` 配置：

\`\`\`javascript
base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/',
\`\`\`

### 修改部署分支

如果你的主分支不是 `main` 或 `master`，需要修改 `.github/workflows/deploy.yml` 中的分支配置：

\`\`\`yaml
on:
  push:
    branches: [ your-branch-name ]
\`\`\`

## 📱 访问网站

部署成功后，你的网站将在以下地址可访问：

\`\`\`
https://你的用户名.github.io/ZGNB/
\`\`\`

## 🔧 故障排除

### 常见问题

1. **404错误**: 检查 `base` 路径配置是否正确
2. **CSS/JS加载失败**: 确保资源路径配置正确
3. **部署失败**: 检查GitHub Actions日志

### 调试步骤

1. 检查GitHub Actions运行日志
2. 确认构建产物是否正确生成
3. 验证GitHub Pages设置是否正确

## 🚨 安全建议

1. **定期更改密码**: 建议定期更新访问密码
2. **监控访问日志**: 定期检查谁在访问你的网站
3. **限制链接分享**: 只将动态链接分享给可信任的人
4. **设置合理的过期时间**: 不要生成过长有效期的链接

## 📝 维护

### 更新网站内容

1. 修改代码后推送到主分支
2. GitHub Actions会自动重新部署
3. 等待几分钟后访问新版本

### 管理访问链接

定期清理过期的动态访问链接，保持系统整洁。

## 💡 高级功能

### 环境变量配置

可以在GitHub仓库设置中添加Secrets来存储敏感配置：

1. 进入仓库 `Settings` > `Secrets and variables` > `Actions`
2. 添加需要的环境变量
3. 在代码中通过 `process.env` 访问

### 自定义域名

如果你有自己的域名，可以：

1. 在仓库根目录添加 `CNAME` 文件
2. 内容为你的域名（如：`example.com`）
3. 在域名DNS设置中添加CNAME记录指向 `username.github.io`

## 📞 支持

如果遇到问题，可以：

1. 查看GitHub Pages官方文档
2. 检查项目的Issues页面
3. 联系项目维护者 