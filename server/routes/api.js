const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../data');
const KNOWLEDGE_BASE_FILE = path.join(DATA_DIR, 'knowledge-base.json');
const METHODOLOGIES_FILE = path.join(DATA_DIR, 'methodologies.json');
const DETAILS_DIR = path.join(DATA_DIR, 'details');
const METHODOLOGY_DETAILS_DIR = path.join(DATA_DIR, 'methodology-details');

// 获取主数据
router.get('/knowledge-base', async (req, res) => {
  try {
    const data = await fs.readJson(KNOWLEDGE_BASE_FILE);
    
    // 确保时间点按倒序排列（最新的在前面）
    if (data.timePoints && Array.isArray(data.timePoints)) {
      data.timePoints.sort((a, b) => {
        // 提取年、月、周进行比较
        const parseTime = (tp) => {
          const match = tp.match(/(\d{4})年(\d+)月第(\d+)周/);
          if (match) {
            return {
              year: parseInt(match[1]),
              month: parseInt(match[2]),
              week: parseInt(match[3])
            };
          }
          return { year: 0, month: 0, week: 0 };
        };
        
        const timeA = parseTime(a);
        const timeB = parseTime(b);
        
        // 倒序排序：最新的时间在前面
        if (timeA.year !== timeB.year) return timeB.year - timeA.year;
        if (timeA.month !== timeB.month) return timeB.month - timeA.month;
        return timeB.week - timeA.week;
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('读取知识库数据失败:', error);
    res.status(500).json({ error: '无法加载知识库数据' });
  }
});

// ============= 方法论相关API =============

// 获取方法论数据
router.get('/methodologies', async (req, res) => {
  try {
    // 确保方法论数据目录存在
    await fs.ensureDir(METHODOLOGY_DETAILS_DIR);
    
    let data;
    if (await fs.pathExists(METHODOLOGIES_FILE)) {
      data = await fs.readJson(METHODOLOGIES_FILE);
    } else {
      // 创建默认的方法论数据
      data = getDefaultMethodologiesData();
      await fs.writeJson(METHODOLOGIES_FILE, data, { spaces: 2 });
    }
    
    res.json(data);
  } catch (error) {
    console.error('读取方法论数据失败:', error);
    res.status(500).json({ error: '无法加载方法论数据' });
  }
});

// 获取方法论详情
router.get('/methodology-detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const detailFile = path.join(METHODOLOGY_DETAILS_DIR, `${id}.md`);
    
    if (await fs.pathExists(detailFile)) {
      const content = await fs.readFile(detailFile, 'utf8');
      res.json({ content, id });
    } else {
      // 返回默认内容
      const defaultContent = getDefaultMethodologyContent(id);
      res.json({ content: defaultContent, id });
    }
  } catch (error) {
    console.error('读取方法论详情失败:', error);
    res.status(500).json({ error: '无法加载方法论详情' });
  }
});

// 添加新方法论
router.post('/add-methodology', async (req, res) => {
  try {
    const { category, title, summary, difficulty, tags, content } = req.body;
    
    // 验证必需字段
    if (!category || !title || !summary) {
      return res.status(400).json({ error: '缺少必需字段' });
    }
    
    // 读取现有数据
    let methodologiesData;
    if (await fs.pathExists(METHODOLOGIES_FILE)) {
      methodologiesData = await fs.readJson(METHODOLOGIES_FILE);
    } else {
      methodologiesData = getDefaultMethodologiesData();
    }
    
    // 生成ID
    const id = generateMethodologyId(category, title);
    
    // 创建方法论对象
    const methodology = {
      id,
      category,
      title,
      summary,
      difficulty: difficulty || 'beginner',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
      views: 0,
      rating: 3.0,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // 添加到数据中
    methodologiesData.methodologies.push(methodology);
    
    // 更新分类列表
    if (!methodologiesData.categories.includes(category)) {
      methodologiesData.categories.push(category);
    }
    
    // 保存数据
    await fs.writeJson(METHODOLOGIES_FILE, methodologiesData, { spaces: 2 });
    
    // 保存详情内容
    if (content) {
      const detailFile = path.join(METHODOLOGY_DETAILS_DIR, `${id}.md`);
      await fs.writeFile(detailFile, content);
    }
    
    res.json({ 
      success: true, 
      id,
      message: '方法论添加成功',
      data: methodology
    });
    
  } catch (error) {
    console.error('添加方法论失败:', error);
    res.status(500).json({ error: '添加方法论失败: ' + error.message });
  }
});

// ============= 知识库原有API =============

// 获取详情内容
router.get('/detail/:detailId', async (req, res) => {
  try {
    const { detailId } = req.params;
    const detailFile = path.join(DETAILS_DIR, `${detailId}.md`);
    
    if (await fs.pathExists(detailFile)) {
      const content = await fs.readFile(detailFile, 'utf8');
      res.json({ content, detailId });
    } else {
      res.status(404).json({ error: '详情内容未找到' });
    }
  } catch (error) {
    console.error('读取详情失败:', error);
    res.status(500).json({ error: '无法加载详情内容' });
  }
});

// 获取筛选选项
router.get('/filters', async (req, res) => {
  try {
    const data = await fs.readJson(KNOWLEDGE_BASE_FILE);
    res.json({
      industries: data.industries || [],
      timePoints: data.timePoints || []
    });
  } catch (error) {
    console.error('读取筛选选项失败:', error);
    res.status(500).json({ error: '无法加载筛选选项' });
  }
});

// ============= 新增的数据管理API =============

// 添加新内容
router.post('/add-content', async (req, res) => {
  try {
    const { timePoint, industry, title, summary, importance, tags, detailContent } = req.body;
    
    // 验证必需字段
    if (!timePoint || !industry || !title || !summary) {
      return res.status(400).json({ error: '缺少必需字段' });
    }
    
    // 读取现有数据
    const knowledgeBase = await fs.readJson(KNOWLEDGE_BASE_FILE);
    
    // 生成详情ID
    const detailId = generateDetailId(industry, timePoint);
    
    // 创建内容对象
    const contentData = {
      title,
      summary,
      detailId,
      importance: importance || 'medium',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [])
    };
    
    // 确保时间点存在
    if (!knowledgeBase.timePoints.includes(timePoint)) {
      knowledgeBase.timePoints.push(timePoint);
      // 按时间倒序排序（最新的在前面）
      knowledgeBase.timePoints.sort((a, b) => {
        // 提取年、月、周进行比较
        const parseTime = (tp) => {
          const match = tp.match(/(\d{4})年(\d+)月第(\d+)周/);
          if (match) {
            return {
              year: parseInt(match[1]),
              month: parseInt(match[2]),
              week: parseInt(match[3])
            };
          }
          return { year: 0, month: 0, week: 0 };
        };
        
        const timeA = parseTime(a);
        const timeB = parseTime(b);
        
        // 倒序排序：最新的时间在前面
        if (timeA.year !== timeB.year) return timeB.year - timeA.year;
        if (timeA.month !== timeB.month) return timeB.month - timeA.month;
        return timeB.week - timeA.week;
      });
    }
    
    // 确保内容结构存在
    if (!knowledgeBase.content[timePoint]) {
      knowledgeBase.content[timePoint] = {};
    }
    
    // 添加内容
    knowledgeBase.content[timePoint][industry] = contentData;
    
    // 保存知识库文件
    await fs.writeJson(KNOWLEDGE_BASE_FILE, knowledgeBase, { spaces: 2 });
    
    // 创建详情文件
    if (detailContent) {
      const detailFile = path.join(DETAILS_DIR, `${detailId}.md`);
      await fs.writeFile(detailFile, detailContent);
    }
    
    res.json({ 
      success: true, 
      detailId,
      message: '内容添加成功',
      data: contentData
    });
    
  } catch (error) {
    console.error('添加内容失败:', error);
    res.status(500).json({ error: '添加内容失败: ' + error.message });
  }
});

// 更新内容
router.put('/update-content', async (req, res) => {
  try {
    const { timePoint, industry, title, summary, importance, tags, detailContent, detailId } = req.body;
    
    if (!timePoint || !industry || !detailId) {
      return res.status(400).json({ error: '缺少必需字段' });
    }
    
    const knowledgeBase = await fs.readJson(KNOWLEDGE_BASE_FILE);
    
    // 检查内容是否存在
    if (!knowledgeBase.content[timePoint] || !knowledgeBase.content[timePoint][industry]) {
      return res.status(404).json({ error: '内容不存在' });
    }
    
    // 更新内容
    const contentData = {
      title: title || knowledgeBase.content[timePoint][industry].title,
      summary: summary || knowledgeBase.content[timePoint][industry].summary,
      detailId,
      importance: importance || knowledgeBase.content[timePoint][industry].importance,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : knowledgeBase.content[timePoint][industry].tags)
    };
    
    knowledgeBase.content[timePoint][industry] = contentData;
    
    // 保存知识库文件
    await fs.writeJson(KNOWLEDGE_BASE_FILE, knowledgeBase, { spaces: 2 });
    
    // 更新详情文件
    if (detailContent) {
      const detailFile = path.join(DETAILS_DIR, `${detailId}.md`);
      await fs.writeFile(detailFile, detailContent);
    }
    
    res.json({ 
      success: true, 
      message: '内容更新成功',
      data: contentData
    });
    
  } catch (error) {
    console.error('更新内容失败:', error);
    res.status(500).json({ error: '更新内容失败: ' + error.message });
  }
});

// 删除内容
router.delete('/delete-content', async (req, res) => {
  try {
    const { timePoint, industry } = req.body;
    
    if (!timePoint || !industry) {
      return res.status(400).json({ error: '缺少必需字段' });
    }
    
    const knowledgeBase = await fs.readJson(KNOWLEDGE_BASE_FILE);
    
    // 检查内容是否存在
    if (!knowledgeBase.content[timePoint] || !knowledgeBase.content[timePoint][industry]) {
      return res.status(404).json({ error: '内容不存在' });
    }
    
    const detailId = knowledgeBase.content[timePoint][industry].detailId;
    
    // 删除内容
    delete knowledgeBase.content[timePoint][industry];
    
    // 如果该时间点没有其他内容，删除时间点
    if (Object.keys(knowledgeBase.content[timePoint]).length === 0) {
      delete knowledgeBase.content[timePoint];
      knowledgeBase.timePoints = knowledgeBase.timePoints.filter(tp => tp !== timePoint);
    }
    
    // 保存知识库文件
    await fs.writeJson(KNOWLEDGE_BASE_FILE, knowledgeBase, { spaces: 2 });
    
    // 删除详情文件
    if (detailId) {
      const detailFile = path.join(DETAILS_DIR, `${detailId}.md`);
      if (await fs.pathExists(detailFile)) {
        await fs.remove(detailFile);
      }
    }
    
    res.json({ 
      success: true, 
      message: '内容删除成功' 
    });
    
  } catch (error) {
    console.error('删除内容失败:', error);
    res.status(500).json({ error: '删除内容失败: ' + error.message });
  }
});

// 获取可用的时间点和行业列表
router.get('/metadata', async (req, res) => {
  try {
    const knowledgeBase = await fs.readJson(KNOWLEDGE_BASE_FILE);
    res.json({
      timePoints: knowledgeBase.timePoints,
      industries: knowledgeBase.industries
    });
  } catch (error) {
    res.status(500).json({ error: '读取元数据失败' });
  }
});

// ============= 方法论管理API =============

// 添加新方法论
router.post('/add-methodology', async (req, res) => {
  try {
    const { category, title, summary, difficulty, rating, tags, content } = req.body;
    
    // 验证必需字段
    if (!category || !title || !summary || !content) {
      return res.status(400).json({ error: '缺少必需字段' });
    }
    
    // 生成方法论ID
    const methodologyId = generateMethodologyId(category, title);
    
    // 创建方法论对象
    const methodologyData = {
      id: methodologyId,
      category,
      title,
      summary,
      difficulty: difficulty || 'intermediate',
      rating: parseFloat(rating) || 4.0,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
      views: 0,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // 读取或创建方法论数据文件
    const methodologiesFile = path.join(__dirname, '../data/methodologies.json');
    let methodologiesData;
    
    try {
      methodologiesData = await fs.readJson(methodologiesFile);
    } catch (error) {
      // 如果文件不存在，创建默认数据结构
      methodologiesData = getDefaultMethodologiesData();
    }
    
    // 确保分类存在
    if (!methodologiesData.categories.includes(category)) {
      methodologiesData.categories.push(category);
    }
    
    // 添加方法论
    methodologiesData.methodologies.push(methodologyData);
    
    // 按更新时间排序（最新的在前面）
    methodologiesData.methodologies.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // 保存方法论数据文件
    await fs.writeJson(methodologiesFile, methodologiesData, { spaces: 2 });
    
    // 创建详情文件
    const detailsDir = path.join(__dirname, '../data/methodology-details');
    await fs.ensureDir(detailsDir);
    const detailFile = path.join(detailsDir, `${methodologyId}.md`);
    await fs.writeFile(detailFile, content);
    
    res.json({ 
      success: true, 
      id: methodologyId,
      message: '方法论添加成功',
      data: methodologyData
    });
    
  } catch (error) {
    console.error('添加方法论失败:', error);
    res.status(500).json({ error: '添加方法论失败: ' + error.message });
  }
});

// 更新方法论
router.put('/update-methodology/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, summary, difficulty, rating, tags, content } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: '缺少方法论ID' });
    }
    
    const methodologiesFile = path.join(__dirname, '../data/methodologies.json');
    const methodologiesData = await fs.readJson(methodologiesFile);
    
    // 查找方法论
    const methodologyIndex = methodologiesData.methodologies.findIndex(m => m.id === id);
    if (methodologyIndex === -1) {
      return res.status(404).json({ error: '方法论不存在' });
    }
    
    // 更新方法论数据
    const updatedMethodology = {
      ...methodologiesData.methodologies[methodologyIndex],
      category: category || methodologiesData.methodologies[methodologyIndex].category,
      title: title || methodologiesData.methodologies[methodologyIndex].title,
      summary: summary || methodologiesData.methodologies[methodologyIndex].summary,
      difficulty: difficulty || methodologiesData.methodologies[methodologyIndex].difficulty,
      rating: rating ? parseFloat(rating) : methodologiesData.methodologies[methodologyIndex].rating,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : methodologiesData.methodologies[methodologyIndex].tags),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    methodologiesData.methodologies[methodologyIndex] = updatedMethodology;
    
    // 按更新时间排序
    methodologiesData.methodologies.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // 保存文件
    await fs.writeJson(methodologiesFile, methodologiesData, { spaces: 2 });
    
    // 更新详情文件
    if (content) {
      const detailsDir = path.join(__dirname, '../data/methodology-details');
      const detailFile = path.join(detailsDir, `${id}.md`);
      await fs.writeFile(detailFile, content);
    }
    
    res.json({ 
      success: true, 
      message: '方法论更新成功',
      data: updatedMethodology
    });
    
  } catch (error) {
    console.error('更新方法论失败:', error);
    res.status(500).json({ error: '更新方法论失败: ' + error.message });
  }
});

// 删除方法论
router.delete('/delete-methodology/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: '缺少方法论ID' });
    }
    
    const methodologiesFile = path.join(__dirname, '../data/methodologies.json');
    const methodologiesData = await fs.readJson(methodologiesFile);
    
    // 查找并删除方法论
    const methodologyIndex = methodologiesData.methodologies.findIndex(m => m.id === id);
    if (methodologyIndex === -1) {
      return res.status(404).json({ error: '方法论不存在' });
    }
    
    methodologiesData.methodologies.splice(methodologyIndex, 1);
    
    // 保存文件
    await fs.writeJson(methodologiesFile, methodologiesData, { spaces: 2 });
    
    // 删除详情文件
    const detailsDir = path.join(__dirname, '../data/methodology-details');
    const detailFile = path.join(detailsDir, `${id}.md`);
    if (await fs.pathExists(detailFile)) {
      await fs.remove(detailFile);
    }
    
    res.json({ 
      success: true, 
      message: '方法论删除成功' 
    });
    
  } catch (error) {
    console.error('删除方法论失败:', error);
    res.status(500).json({ error: '删除方法论失败: ' + error.message });
  }
});

// ============= 辅助函数 =============

// 生成详情ID的辅助函数
function generateDetailId(industry, timePoint) {
  const industryMap = {
    '人工智能': 'ai',
    '金融科技': 'fintech',
    '新能源': 'energy',
    '生物医药': 'biotech',
    '区块链': 'blockchain',
    '半导体': 'semiconductor',
    '新材料': 'material',
    '航空航天': 'aerospace',
    '5G通信': '5g',
    '元宇宙': 'metaverse',
    '机器人': 'robot',
    '其他': 'other'
  };
  
  const industryCode = industryMap[industry] || 'other';
  
  // 将时间点转换为代码格式
  const timeMatch = timePoint.match(/(\d{4})年(\d+)月第(\d+)周/);
  if (timeMatch) {
    const year = timeMatch[1];
    const month = timeMatch[2].padStart(2, '0');
    const week = timeMatch[3].padStart(2, '0');
    const timeCode = `${year}m${month}w${week}`;
    const timestamp = Date.now().toString().slice(-3);
    return `${industryCode}_${timeCode}_${timestamp}`;
  }
  
  // fallback
  const timestamp = Date.now().toString().slice(-3);
  return `${industryCode}_${Date.now()}_${timestamp}`;
}

// 生成方法论ID
function generateMethodologyId(category, title) {
  const categoryMap = {
    '产品设计': 'prod',
    '技术架构': 'tech',
    '管理方法': 'mgmt',
    '分析框架': 'analysis',
    '创新思维': 'innovation',
    '商业模式': 'business',
    '用户研究': 'research',
    '数据分析': 'data'
  };
  
  const categoryCode = categoryMap[category] || 'other';
  const titleCode = title.substring(0, 10).replace(/\s+/g, '_');
  const timestamp = Date.now().toString().slice(-6);
  
  return `${categoryCode}_${timestamp}`;
}

// 获取默认方法论数据
function getDefaultMethodologiesData() {
  return {
    categories: [
      '产品设计', '技术架构', '管理方法', '分析框架', 
      '创新思维', '商业模式', '用户研究', '数据分析'
    ],
    methodologies: [
      {
        id: 'prod_001',
        category: '产品设计',
        title: '用户故事地图方法',
        summary: '通过用户故事地图来梳理产品功能优先级和用户旅程的系统性方法',
        difficulty: 'intermediate',
        tags: ['用户体验', '产品规划', '敏捷开发', '用户旅程'],
        views: 1250,
        rating: 4.5,
        updatedAt: '2024-01-15'
      },
      {
        id: 'tech_001',
        category: '技术架构',
        title: '微服务架构设计原则',
        summary: '构建可扩展、高可用微服务系统的核心设计原则和最佳实践',
        difficulty: 'advanced',
        tags: ['微服务', '系统设计', '架构', '可扩展性'],
        views: 2100,
        rating: 4.8,
        updatedAt: '2024-01-12'
      },
      {
        id: 'mgmt_001',
        category: '管理方法',
        title: 'OKR目标管理法',
        summary: '通过OKR（目标与关键结果）来实现团队目标对齐和高效执行',
        difficulty: 'beginner',
        tags: ['目标管理', 'OKR', '团队协作', '绩效管理'],
        views: 890,
        rating: 4.2,
        updatedAt: '2024-01-10'
      },
      {
        id: 'analysis_001',
        category: '分析框架',
        title: 'SWOT分析法',
        summary: '系统分析优势、劣势、机会、威胁的经典战略分析工具',
        difficulty: 'beginner',
        tags: ['战略分析', 'SWOT', '竞争分析', '决策工具'],
        views: 1560,
        rating: 4.0,
        updatedAt: '2024-01-08'
      }
    ]
  };
}

// 获取默认方法论内容
function getDefaultMethodologyContent(id) {
  return `# 方法论详情

## 概述
这是一个实用的方法论，可以帮助您更好地解决问题和提升效率。

## 适用场景
- 场景一：具体的应用情况描述
- 场景二：另一种典型的使用场景
- 场景三：高级应用场景

## 核心步骤

### 步骤1：准备阶段
详细描述第一个步骤的具体操作和注意事项...

### 步骤2：执行阶段
详细描述第二个步骤的具体操作和注意事项...

### 步骤3：评估阶段
详细描述第三个步骤的具体操作和注意事项...

## 实践案例
通过具体的案例来说明这个方法论的实际应用效果...

## 注意事项
- 注意事项1
- 注意事项2
- 注意事项3

## 相关资源
- 推荐阅读1
- 推荐阅读2
- 相关工具推荐`;
}

module.exports = router; 