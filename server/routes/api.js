const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

// ============= 认证相关API =============

// 验证访问密码
router.post('/auth/verify', (req, res) => {
  try {
    const { password } = req.body;
    const accessPassword = process.env.ACCESS_PASSWORD || '1234'; // 默认密码
    
    if (!password) {
      return res.status(400).json({ error: '请输入密码' });
    }
    
    if (password === accessPassword) {
      // 生成简单的访问令牌
      const token = Buffer.from(`verified_${Date.now()}`).toString('base64');
      res.json({ 
        success: true, 
        message: '验证成功',
        token 
      });
    } else {
      res.status(401).json({ error: '密码错误' });
    }
  } catch (error) {
    console.error('密码验证失败:', error);
    res.status(500).json({ error: '验证服务异常' });
  }
});

// 权限检查中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: '需要认证' });
  }
  
  try {
    // 简单的token验证（在生产环境中应该使用更安全的方式）
    const decoded = Buffer.from(token, 'base64').toString();
    if (decoded.startsWith('verified_')) {
      next();
    } else {
      res.status(401).json({ error: '无效的访问令牌' });
    }
  } catch (error) {
    res.status(401).json({ error: '无效的访问令牌' });
  }
};

// ============= 原有API =============

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../data');
const KNOWLEDGE_BASE_FILE = path.join(DATA_DIR, 'knowledge-base.json');
const DETAILS_DIR = path.join(DATA_DIR, 'details');

// 获取主数据（需要认证）
router.get('/knowledge-base', authMiddleware, async (req, res) => {
  try {
    const data = await fs.readJson(KNOWLEDGE_BASE_FILE);
    res.json(data);
  } catch (error) {
    console.error('读取知识库数据失败:', error);
    res.status(500).json({ error: '无法加载知识库数据' });
  }
});

// 获取详情内容（需要认证）
router.get('/detail/:detailId', authMiddleware, async (req, res) => {
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

// 获取筛选选项（需要认证）
router.get('/filters', authMiddleware, async (req, res) => {
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
      // 按时间顺序排序
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
        
        if (timeA.year !== timeB.year) return timeA.year - timeB.year;
        if (timeA.month !== timeB.month) return timeA.month - timeB.month;
        return timeA.week - timeB.week;
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

module.exports = router; 