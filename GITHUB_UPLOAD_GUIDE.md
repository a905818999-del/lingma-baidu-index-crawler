# GitHub 仓库创建与上传指南

## 步骤 1: 在 GitHub 上创建仓库

1. 访问 [GitHub](https://github.com) 并登录你的账户
2. 点击右上角的 "+" 号，选择 "New repository"
3. 在 "Repository name" 字段中输入: `lingma-baidu-index`
4. 在 "Description" 字段中输入: `百度指数数据抓取工具 - 基于 Node.js、Playwright 和 Express 构建`
5. 选择 "Public"（公开）选项
6. **重要**: 不要勾选 "Initialize this repository with a README"、".gitignore" 或 "License"
7. 点击 "Create repository" 按钮

## 步骤 2: 将本地代码推送到 GitHub

创建仓库后，你会看到类似以下的说明：

```bash
git remote add origin https://github.com/YOUR_USERNAME/lingma-baidu-index.git
git branch -M main
git push -u origin main
```

请在终端中执行这些命令，将本地代码推送到 GitHub 仓库。

## 步骤 3: 验证上传结果

推送完成后，刷新 GitHub 仓库页面，你应该能看到所有文件都已成功上传。

## 故障排除

如果遇到任何问题，请检查：

1. 确保你已正确安装并配置 Git
2. 确保你有权限访问该 GitHub 仓库
3. 检查网络连接是否正常

如有其他问题，请参考 [GitHub 官方文档](https://docs.github.com)。