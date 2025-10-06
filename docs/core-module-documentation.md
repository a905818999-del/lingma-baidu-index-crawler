# 百度指数数据抓取工具 - 核心模块文档

## 模块概述

百度指数数据抓取工具是一个基于 Playwright 的网页数据采集系统，专门用于从百度指数网站获取关键词搜索数据。

## 核心功能模块

### 1. 浏览器管理模块
- 初始化浏览器实例
- 保持浏览器会话状态
- 管理浏览器生命周期

### 2. 用户认证模块
- 手动登录百度指数账户
- 检测登录状态
- 维持登录会话

### 3. 数据采集模块
- 关键词搜索功能
- 页面数据提取
- 数值解析与格式化

### 4. 数据处理模块
- 结果存储与管理
- 数据格式化处理
- 时间戳记录

### 5. 用户界面模块
- Web界面展示
- 用户交互处理
- 结果表格显示

### 6. 数据导出模块
- CSV格式导出
- 文件存储管理
- 导出状态反馈

## 核心接口定义

### 浏览器控制接口
```javascript
// 初始化浏览器
async function initializeBrowser()

// 检查浏览器状态
async function isBrowserInitialized()

// 关闭浏览器
async function closeBrowser()
```

### 登录管理接口
```javascript
// 打开登录页面
async function openLogin()

// 检查登录状态
async function checkLoginStatus()

// 跳过登录检查
async function skipLoginCheck()
```

### 数据采集接口
```javascript
// 搜索关键词
async function searchKeywords(keyword)

// 提取数值数据
async function extractIndexData(page, keyword)
```

### 数据导出接口
```javascript
// 导出为CSV
async function exportToCSV()
```

## 数据结构定义

### 搜索结果结构
```json
{
  "keyword": "关键词",
  "overallAvg": "整体日平均值",
  "mobileAvg": "移动日均值",
  "newsAvg": "资讯指数日均值",
  "timestamp": "时间戳"
}
```

## 扩展点设计

### 1. 数据源适配器扩展点
- 支持添加其他数据源
- 统一数据采集接口
- 保持现有百度指数功能不变

### 2. 数据处理扩展点
- 支持自定义数据处理逻辑
- 提供数据过滤和转换接口
- 保持核心数据结构不变

### 3. 导出格式扩展点
- 支持多种导出格式（Excel、JSON等）
- 统一导出接口
- 保持CSV导出功能不变

### 4. UI组件扩展点
- 支持添加新的UI组件
- 提供组件注册机制
- 保持现有界面功能不变

## 使用约束

### 不可修改部分
1. 核心数据采集逻辑不得修改
2. 现有用户界面结构不得修改
3. 关键词搜索流程不得修改
4. 数据存储格式不得修改

### 扩展开发规范
1. 新功能必须通过扩展点接入
2. 不得直接修改核心模块代码
3. 必须保持向后兼容性
4. 需要提供完整的功能文档

## 部署与运行

### 环境要求
- Node.js 14.x 或更高版本
- Firefox 浏览器（通过 Playwright 安装）
- 网络访问权限（访问百度指数网站）

### 启动流程
1. npm install（安装依赖）
2. npx playwright install firefox（安装浏览器）
3. node server.js（启动服务）
4. 访问 http://localhost:3000 使用应用

此文档定义了百度指数数据抓取工具的核心模块结构和扩展规范，为后续功能扩展提供了清晰的指导原则。