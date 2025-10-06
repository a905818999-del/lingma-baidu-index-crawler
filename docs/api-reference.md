# API 参考文档

## 概述

本文档描述了百度指数数据抓取工具提供的 RESTful API 接口，供开发者集成和扩展使用。

## 基础信息

- 服务器地址: `http://localhost:3000`
- 数据格式: JSON
- 字符编码: UTF-8

## API 接口列表

### 1. 浏览器管理接口

#### 初始化浏览器
```
POST /init
```

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "浏览器初始化成功"
}
```

#### 关闭浏览器
```
POST /close
```

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "浏览器已关闭"
}
```

### 2. 用户认证接口

#### 登录百度指数
```
POST /login
```

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "请在浏览器中手动登录百度指数，登录完成后点击\"确认登录\"按钮"
}
```

#### 确认登录状态
```
POST /confirm-login
```

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功"
}
```

### 3. 数据采集接口

#### 搜索关键词
```
POST /search
```

**请求参数**:
```json
{
  "keywords": ["关键词1", "关键词2"]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "keyword": "关键词1",
      "avgValue": "24,238 17,205 8,819,510",
      "timestamp": "2025-10-06T08:30:00.000Z"
    }
  ]
}
```

### 4. 数据导出接口

#### 导出为CSV
```
POST /export
```

**请求参数**:
```json
{
  "data": [
    {
      "keyword": "关键词1",
      "avgValue": "24,238 17,205 8,819,510",
      "timestamp": "2025-10-06T08:30:00.000Z"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "数据导出成功",
  "filePath": "data/baidu_index_data.csv"
}
```

### 5. 调试接口

#### 调试页面元素
```
POST /debug-elements
```

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "selector": ".veui-table-column-right",
      "text": "24,238",
      "numbers": ["24,238"],
      "parentText": "关键词 整体趋势 移动趋势 资讯指数"
    }
  ]
}
```

## 错误处理

### 通用错误响应格式
```json
{
  "success": false,
  "message": "错误描述信息"
}
```

### 常见错误码
- 400: 请求参数错误
- 500: 服务器内部错误

## 使用示例

### JavaScript 示例
```javascript
// 初始化浏览器
fetch('http://localhost:3000/init', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// 搜索关键词
fetch('http://localhost:3000/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    keywords: ['人工智能', '机器学习']
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 注意事项

1. 使用前需要先初始化浏览器并登录
2. 关键词搜索需要在登录成功后进行
3. 导出数据前需要先进行搜索获取数据
4. 请合理控制请求频率，避免对百度服务器造成过大压力