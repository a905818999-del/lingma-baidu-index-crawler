# LINGMA-BAIDU 百度指数数据抓取工具

这是一个基于 Node.js、Playwright 和 Express 构建的百度指数数据抓取工具，可以自动抓取百度指数数据并导出为 CSV 文件。
---------vibe coding的小尝试

## 功能特点

- 自动化抓取百度指数数据
- 支持批量关键词搜索
- 提取整体日平均值、移动日均值和资讯指数日均值
- 数据导出为 CSV 格式
- 友好的 Web 界面操作

## 技术栈

- Node.js
- Playwright (浏览器自动化)
- Express (Web 服务器)
- HTML/CSS/JavaScript (前端界面)

## 安装与使用

### 环境要求

- Node.js (版本 12+)
- npm 或 yarn

### 简单一键运行（Windows）

对于 Windows 用户，可以直接运行 `run.bat` 脚本，它会自动完成依赖安装和服务器启动：

1. 双击 `run.bat` 文件
2. 或者在命令提示符中执行 `run.bat`
3. 在浏览器中访问 `http://localhost:3000`

### 手动安装步骤

1. 克隆或下载本项目
2. 安装依赖：
   ```bash
   npm install
   ```

3. 安装 Playwright Firefox 浏览器：
   ```bash
   npx playwright install firefox
   ```

4. 启动服务器：
   ```bash
   npm start
   ```

5. 在浏览器中访问 `http://localhost:3000`

### 使用说明

1. 点击"初始化浏览器"按钮
2. 点击"登录百度指数"按钮，并在打开的浏览器窗口中手动登录百度指数
3. 登录完成后点击"确认登录"按钮
4. 在文本框中输入要搜索的关键词（每行一个）
5. 点击"搜索关键词"按钮开始抓取数据
6. 点击"导出数据"按钮将数据保存为 CSV 文件

## 文档

有关项目架构和扩展开发的详细信息，请参阅以下文档：

- [核心模块文档](docs/core-module-documentation.md) - 项目核心功能的详细说明
- [扩展开发指南](docs/extension-guide.md) - 如何在不修改核心功能的前提下扩展新功能
- [API 参考文档](docs/api-reference.md) - RESTful API 接口详细说明

## API 接口说明

本项目提供以下 RESTful API 接口：

- `POST /init` - 初始化浏览器
- `POST /login` - 登录百度指数
- `POST /confirm-login` - 确认登录状态
- `POST /search` - 搜索关键词并获取指数数据
- `POST /export` - 导出数据为 CSV 文件
- `POST /debug-elements` - 调试页面元素
- `POST /close` - 关闭浏览器

## 项目结构

```
lingma-baidu/
├── docs/                   # 项目文档
│   ├── core-module-documentation.md
│   ├── extension-guide.md
│   └── api-reference.md
├── public/
│   └── index.html          # 前端界面
├── data/
│   └── baidu_index_data.csv # 示例数据文件
├── server.js               # 主服务器文件
├── run.bat                 # 一键启动脚本 (Windows)
├── package.json            # 项目配置文件
└── README.md               # 项目说明文件
```

## 数据格式

导出的 CSV 文件包含以下列：

- 关键词
- 整体日平均值
- 移动日均值
- 资讯指数日均值
- 时间戳

## 注意事项

1. 由于百度指数有反爬虫机制，需要手动登录
2. 请合理控制抓取频率，避免对百度服务器造成过大压力
3. 本工具仅供学习交流使用，请遵守相关法律法规

## 许可证

本项目采用 ISC 许可证，详情请查看 [LICENSE](LICENSE) 文件。