# 知识库数据管理工具

本目录包含用于管理知识库数据的各种工具，让你可以轻松添加、编辑和删除知识库内容，无需手动操作JSON文件。

## 🤖 智能数据管理工具 (推荐)

### `smart-data-manager.html`

**全新的Web界面管理工具**，提供完全自动化的数据管理体验：

#### ✨ 主要特性
- **🔄 实时数据同步** - 直接与后端API交互，无需手动操作文件
- **📝 可视化编辑** - 友好的Web界面，支持添加、编辑、删除
- **🎯 智能表单** - 自动填充、验证和预览功能
- **🔍 内容搜索** - 快速查找和筛选现有内容
- **📊 统计信息** - 实时显示内容统计和状态
- **📱 响应式设计** - 支持桌面和移动设备

#### 🚀 使用方法
1. 确保知识库服务器正在运行 (`npm run dev` 或 `node server/app.js`)
2. 在浏览器中打开 `tools/smart-data-manager.html`
3. 开始添加和管理内容！

#### 🎮 操作指南
- **添加内容**: 填写表单 → 点击"保存内容" → 自动保存到数据库
- **编辑内容**: 在右侧点击现有内容 → 修改表单 → 点击"更新内容"
- **删除内容**: 选择内容 → 点击"删除内容" → 确认删除
- **快速操作**: 使用"当前周"、"下一周"按钮快速设置时间
- **内容预览**: 点击"预览"按钮查看格式化后的内容

## 📱 命令行工具

### `add-data.js`

**增强版命令行数据添加工具**，支持新的时间格式和完整的数据管理功能：

#### 🔧 使用方法
```bash
# 在项目根目录运行
node tools/add-data.js
```

#### ✨ 新增特性
- ✅ 支持新的时间格式 (2025年1月第1周)
- ✅ 智能时间选择 (当前周/下一周/自定义)
- ✅ 内容冲突检测和覆盖确认
- ✅ 扩展的行业支持 (12个行业)
- ✅ 改进的用户体验和错误处理
- ✅ 详细的操作指南和故障排除

#### 📋 操作流程
1. 选择时间点 (当前周/下一周/自定义)
2. 选择行业 (从12个选项中选择)
3. 输入标题、摘要、标签和重要性
4. 输入详细内容 (支持Markdown)
5. 自动生成ID并保存文件

## ⏰ 时间点管理

### 添加新时间点

智能管理工具支持动态添加新的时间点：

- **方式1**: 点击"➕ 添加新时间"按钮
- **方式2**: 直接在时间点输入框中输入新的时间格式
- **方式3**: 使用datalist下拉选择现有时间点

### 时间格式支持
- **当前支持**: `2025年2月第1周` (示例数据)
- **可扩展**: 任何符合 `YYYY年M月第W周` 格式的时间点
- **自动排序**: 新添加的时间点会自动按时间顺序排列

## 🎯 最佳实践

### 1. 内容添加工作流
1. **使用智能管理工具** - 优先使用 `smart-data-manager.html`
2. **批量添加** - 可使用命令行工具 `add-data.js` 快速批量添加
3. **内容验证** - 在主网站中查看添加的内容效果

### 2. 时间格式规范
- **标准格式**: `2025年1月第1周`、`2025年2月第3周`
- **自动生成**: 使用"当前周"和"下一周"按钮
- **自定义时间**: 按照标准格式手动输入

### 3. 内容组织建议
- **标题**: 简洁明了，突出关键信息
- **摘要**: 50-100字概述，突出重点
- **标签**: 3-5个关键词，便于搜索
- **详细内容**: 使用Markdown格式，结构化组织

### 4. 数据安全
- 定期备份 `server/data/` 目录
- 使用版本控制管理数据变更
- 重要操作前先预览确认

## 🔧 故障排除

### 常见问题

#### 1. 智能管理工具无法加载数据
- **检查服务器状态**: 确保 `node server/app.js` 正在运行
- **检查端口**: 默认端口3000，确保没有被占用
- **检查网络**: 确保可以访问 `http://localhost:3000`

#### 2. 时间格式错误
- **正确格式**: `2025年1月第1周`
- **避免**: `2024-W01`、`2025-1-1` 等旧格式

#### 3. 添加内容失败
- **必填字段**: 确保时间点、行业、标题、摘要都已填写
- **字符限制**: 避免使用特殊字符
- **网络连接**: 检查与服务器的连接

#### 4. 文件权限问题
```bash
# 确保有写入权限
chmod -R 755 server/data/
```

### 错误码说明

- **400**: 缺少必需字段
- **404**: 内容不存在
- **500**: 服务器内部错误

## 📈 技术架构

### 数据流程
```
智能管理工具 → REST API → JSON文件 + Markdown文件
     ↓              ↓            ↓
  Web界面    ←  Express服务器 ← 文件系统
```

### API端点
- `GET /api/knowledge-base` - 获取知识库数据
- `GET /api/metadata` - 获取元数据
- `POST /api/add-content` - 添加新内容
- `PUT /api/update-content` - 更新内容
- `DELETE /api/delete-content` - 删除内容
- `GET /api/detail/:id` - 获取详细内容

### 文件结构
```
server/data/
├── knowledge-base.json    # 主数据文件
└── details/              # 详细内容目录
    ├── ai_2025m01w01_001.md
    ├── fintech_2025m01w02_002.md
    └── ...
```

## 🎉 开始使用

1. **启动服务器**:
   ```bash
   npm run dev
   ```

2. **打开智能管理工具**:
   ```bash
   # 在浏览器中打开
   tools/smart-data-manager.html
   ```

3. **开始添加内容**! 🚀

---

💡 **提示**: 推荐使用智能数据管理工具，它提供最佳的用户体验和完整的功能。命令行工具适合自动化脚本或批量操作。 