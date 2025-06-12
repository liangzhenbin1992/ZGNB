# 知识库展示系统

一个基于Vue.js和Node.js的知识库管理和展示平台，支持按时间和行业维度组织信息。

## ✨ 特性

- 📊 **二维表格展示**: 时间 × 行业的矩阵式信息展示
- 🔍 **智能筛选**: 支持按行业、时间点、关键词筛选
- 📱 **响应式设计**: 适配桌面端和移动端
- 🎨 **简约美观**: 现代化UI设计，用户体验友好
- 📝 **Markdown支持**: 详情内容支持Markdown格式
- 🔒 **数据安全**: 本地数据存储，支持定期更新

## 🏗️ 技术架构

### 前端
- **Vue 3**: 现代化的渐进式框架
- **Element Plus**: 企业级UI组件库
- **Vite**: 快速的构建工具
- **Axios**: HTTP客户端

### 后端
- **Node.js**: JavaScript运行环境
- **Express**: Web应用框架
- **fs-extra**: 文件系统操作

### 数据存储
- **JSON文件**: 主数据结构存储
- **Markdown文件**: 详情内容存储

## 📁 项目结构

```
knowledge-base-website/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── router/        # 路由配置
│   │   └── main.js        # 入口文件
│   ├── index.html         # HTML模板
│   ├── vite.config.js     # Vite配置
│   └── package.json       # 前端依赖
├── server/                # 后端代码
│   ├── routes/            # API路由
│   ├── data/              # 数据文件
│   │   ├── knowledge-base.json    # 主数据
│   │   └── details/       # 详情文件夹
│   └── app.js             # 服务器入口
├── package.json           # 项目依赖
└── README.md             # 项目说明
```

## 🚀 快速开始

### 1. 安装依赖
```bash
npm run setup
```

### 2. 开发模式
```bash
npm run dev
```
访问 http://localhost:5173

### 3. 生产构建
```bash
npm run build
npm start
```

## 📝 数据格式

### 主数据结构 (`server/data/knowledge-base.json`)
```json
{
  "industries": ["人工智能", "金融科技", "新能源"],
  "timePoints": ["2024-W01", "2024-W02"],
  "content": {
    "2024-W01": {
      "人工智能": {
        "title": "标题",
        "summary": "摘要",
        "detailId": "ai_2024w01_001",
        "importance": "high",
        "tags": ["标签1", "标签2"]
      }
    }
  }
}
```

### 详情文件 (`server/data/details/*.md`)
支持标准Markdown格式，用于展示详细内容。

## 🔧 自定义配置

### 添加新行业
1. 编辑 `server/data/knowledge-base.json`
2. 在 `industries` 数组中添加新行业名称

### 添加新时间点
1. 在 `timePoints` 数组中添加新时间点（格式：YYYY-WXX）
2. 在 `content` 对象中添加对应数据

### 添加新内容
1. 在对应的时间点和行业位置添加内容对象
2. 在 `server/data/details/` 目录创建对应的markdown文件

## 🔒 安全特性

### 动态路径配置
可通过环境变量配置访问路径：
```bash
export BASE_PATH="/custom-path"
npm start
```

### 访问控制
可在 `server/app.js` 中添加简单的认证中间件。

## 📱 响应式支持

- 桌面端：完整功能体验
- 平板端：优化的触控交互
- 手机端：精简的移动端界面

## 🔄 数据更新

### 手动更新
直接编辑 `server/data/` 目录下的JSON和Markdown文件。

### 批量导入
支持从Excel或CSV文件批量导入数据（需要额外开发导入脚本）。

## 📋 TODO

- [ ] 数据导入/导出功能
- [ ] 用户权限管理
- [ ] 评论和协作功能
- [ ] 数据统计和分析
- [ ] 移动端App

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📄 许可证

MIT License

---

*由AI助手创建 | 适用于信息管理和知识库展示* 