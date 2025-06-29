# 思路方法论管理工具使用指南

## 概述

`methodology-manager.html` 是一个专门用于管理"思路 & 方法论"内容的可视化工具，与现有的 `smart-data-manager.html` 互补，提供完整的内容管理解决方案。

## 功能特点

### 🎯 核心功能
- **分类管理**: 支持8大分类（产品设计、技术架构、管理方法、分析框架、创新思维、商业模式、用户研究、数据分析）
- **智能表单**: 包含分类、标题、摘要、难度等级、推荐指数、标签、详细内容等字段
- **可视化操作**: 现代化UI设计，支持拖拽、点击选择等交互方式
- **实时同步**: 与后端API实时同步，自动保存到数据库
- **内容预览**: 支持添加、编辑、删除、搜索等完整的CRUD操作

### 📊 智能特性
- **自动统计**: 实时显示总方法论数、分类数、平均评分等统计信息
- **智能分类**: 提供预设分类选择，也支持自定义分类
- **标签系统**: 灵活的标签管理，支持键盘快捷操作
- **难度分级**: 三级难度体系（入门、中级、高级）
- **评分系统**: 5星评分体系，支持半星评分

## 使用方法

### 1. 启动服务
```bash
# 确保后端服务运行
cd server
npm start

# 在浏览器中打开工具
# 方式1: 直接打开文件
open tools/methodology-manager.html

# 方式2: 通过HTTP服务器访问
cd tools
python -m http.server 8080
# 然后访问 http://localhost:8080/methodology-manager.html
```

### 2. 添加新方法论

#### 基本信息填写
1. **选择分类**: 点击分类按钮选择，或在自定义分类框中输入新分类
2. **标题**: 输入方法论的标题名称
3. **摘要**: 简要描述方法论的核心内容（建议50-200字）
4. **难度等级**: 选择入门级、中级或高级
5. **推荐指数**: 选择3-5星评分

#### 标签和内容
1. **添加标签**: 在标签输入框中输入关键词，按回车键添加
2. **详细内容**: 使用Markdown格式编写详细内容，支持标题、列表、代码块等格式

#### 保存操作
- 点击"💾 保存方法论"按钮完成添加
- 系统会自动生成唯一ID并保存到数据库
- 保存成功后可选择清空表单继续添加

### 3. 编辑现有方法论

1. 在右侧"现有方法论"列表中点击任一项目
2. 表单会自动填充该方法论的信息
3. 修改需要更新的内容
4. 点击"✏️ 更新内容"按钮保存修改

### 4. 删除方法论

1. 在编辑模式下，点击"🗑️ 删除"按钮
2. 系统会弹出确认对话框
3. 确认后将删除方法论及其详细内容文件

### 5. 搜索和筛选

- 使用搜索框实时筛选方法论
- 支持按标题、分类、标签搜索
- 实时更新搜索结果

## 快捷功能

### 🎲 生成示例
- 点击"生成示例"按钮可快速生成示例数据
- 包含完整的标题、摘要、标签、详细内容
- 适合快速测试和学习使用

### 📋 导入模板
- 点击"导入模板"按钮载入标准模板
- 提供规范化的内容结构
- 帮助保持内容格式一致性

### 🗑️ 清空表单
- 一键清空所有表单数据
- 重置为添加模式
- 快速开始新的方法论录入

## 数据存储

### 文件结构
```
server/data/
├── methodologies.json          # 方法论元数据
└── methodology-details/        # 详细内容文件夹
    ├── prod_001.md            # 产品设计类方法论
    ├── tech_001.md            # 技术架构类方法论
    └── ...
```

### 数据格式
```json
{
  "categories": ["产品设计", "技术架构", "管理方法", "分析框架", "创新思维", "商业模式", "用户研究", "数据分析"],
  "methodologies": [
    {
      "id": "prod_123456",
      "category": "产品设计",
      "title": "用户故事地图方法",
      "summary": "通过用户故事地图来梳理产品功能优先级和用户旅程的系统性方法",
      "difficulty": "intermediate",
      "rating": 4.5,
      "tags": ["用户体验", "产品规划", "敏捷开发"],
      "views": 0,
      "updatedAt": "2024-01-15"
    }
  ]
}
```

## 与现有系统的协同

### 与smart-data-manager.html的区别
- **smart-data-manager.html**: 管理基于时间的知识库内容
- **methodology-manager.html**: 管理基于分类的方法论内容
- 两者数据结构独立，功能互补

### API端点
- `GET /api/methodologies` - 获取所有方法论
- `POST /api/add-methodology` - 添加新方法论  
- `PUT /api/update-methodology/:id` - 更新方法论
- `DELETE /api/delete-methodology/:id` - 删除方法论
- `GET /api/methodology-detail/:id` - 获取方法论详情

## 最佳实践

### 内容编写建议
1. **标题**: 简洁明确，体现方法论核心价值
2. **摘要**: 50-200字，突出适用场景和核心优势
3. **分类**: 选择最贴切的分类，必要时创建新分类
4. **标签**: 3-8个关键词，便于搜索和分类
5. **详细内容**: 使用结构化的Markdown格式，包含：
   - 概述
   - 适用场景
   - 核心步骤
   - 实践案例
   - 注意事项
   - 相关资源

### 质量控制
- 定期检查和更新内容
- 保持格式一致性
- 补充实际案例和经验
- 及时更新过时信息

## 故障排除

### 常见问题
1. **连接失败**: 确保后端服务正在运行（端口3000）
2. **保存失败**: 检查必填字段是否完整
3. **搜索无结果**: 尝试不同的关键词或清空搜索条件

### 离线模式
- 当服务器不可用时，系统会自动切换到离线模式
- 显示预设的示例数据
- 功能受限，但可用于演示和测试

## 技术支持

如需技术支持或功能建议，请通过以下方式联系：
- 检查控制台错误信息
- 查看浏览器开发者工具的网络请求
- 确认API端点的响应状态

---

**注意**: 此工具需要配合后端API服务使用，请确保server端正常运行后再使用管理界面。 