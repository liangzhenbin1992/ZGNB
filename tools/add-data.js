#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

// 配置路径
const DATA_DIR = path.join(__dirname, '../server/data');
const KNOWLEDGE_BASE_FILE = path.join(DATA_DIR, 'knowledge-base.json');
const DETAILS_DIR = path.join(DATA_DIR, 'details');

// 创建读取接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提问函数
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// 获取当前周（新格式）
function getCurrentWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // 计算当前是该月的第几周
  const firstDay = new Date(year, now.getMonth(), 1);
  const currentDay = now.getDate();
  const week = Math.ceil((currentDay + firstDay.getDay()) / 7);
  
  return `${year}年${month}月第${week}周`;
}

// 获取下一周（新格式）
function getNextWeek() {
  const now = new Date();
  now.setDate(now.getDate() + 7); // 下周
  
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const firstDay = new Date(year, now.getMonth(), 1);
  const currentDay = now.getDate();
  const week = Math.ceil((currentDay + firstDay.getDay()) / 7);
  
  return `${year}年${month}月第${week}周`;
}

// 生成详情ID（支持新格式）
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
  
  // 将新时间格式转换为代码格式
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

// 时间点排序函数（倒序：最新的在前面）
function sortTimePoints(timePoints) {
  return timePoints.sort((a, b) => {
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

// 主函数
async function main() {
  console.log('🚀 知识库数据添加工具 (升级版)');
  console.log('==================================\n');

  try {
    // 读取现有数据
    const knowledgeBase = await fs.readJson(KNOWLEDGE_BASE_FILE);
    
    console.log('📅 时间点选项:');
    console.log(`1. 当前周: ${getCurrentWeek()}`);
    console.log(`2. 下一周: ${getNextWeek()}`);
    console.log('3. 自定义时间点');
    
    const timeChoice = await question('\n选择时间点 (1/2/3): ');
    let timePoint;
    
    switch(timeChoice) {
      case '1':
        timePoint = getCurrentWeek();
        break;
      case '2':
        timePoint = getNextWeek();
        break;
      case '3':
        timePoint = await question('输入自定义时间点 (格式: 2025年1月第1周): ');
        break;
      default:
        timePoint = getCurrentWeek();
    }
    
    console.log(`\n选择的时间点: ${timePoint}`);
    
    console.log('\n🏭 可选行业:');
    knowledgeBase.industries.forEach((industry, index) => {
      console.log(`${index + 1}. ${industry}`);
    });
    
    const industryIndex = await question('\n选择行业 (输入数字): ');
    const industry = knowledgeBase.industries[parseInt(industryIndex) - 1];
    
    if (!industry) {
      console.log('❌ 无效的行业选择');
      process.exit(1);
    }
    
    // 检查是否已存在内容
    if (knowledgeBase.content[timePoint] && knowledgeBase.content[timePoint][industry]) {
      console.log(`\n⚠️  该时间点和行业已有内容:`);
      const existing = knowledgeBase.content[timePoint][industry];
      console.log(`标题: ${existing.title}`);
      console.log(`摘要: ${existing.summary}`);
      
      const overwrite = await question('\n是否覆盖现有内容? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('操作已取消');
        process.exit(0);
      }
    }
    
    const title = await question('\n📄 标题: ');
    const summary = await question('📋 摘要: ');
    const tagsInput = await question('🏷️  标签 (用逗号分隔): ');
    const importance = await question('⭐ 重要性 (high/medium/low) [medium]: ') || 'medium';
    
    console.log('\n📝 输入详细内容 (支持Markdown格式，输入 "END" 结束):');
    let detailContent = '';
    let line;
    while ((line = await question('')) !== 'END') {
      detailContent += line + '\n';
    }
    
    // 生成数据
    const detailId = generateDetailId(industry, timePoint);
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const contentData = {
      title,
      summary,
      detailId,
      importance,
      tags
    };
    
    // 更新知识库
    if (!knowledgeBase.timePoints.includes(timePoint)) {
      knowledgeBase.timePoints.push(timePoint);
      knowledgeBase.timePoints = sortTimePoints(knowledgeBase.timePoints);
    }
    
    if (!knowledgeBase.content[timePoint]) {
      knowledgeBase.content[timePoint] = {};
    }
    
    knowledgeBase.content[timePoint][industry] = contentData;
    
    // 更新元数据
    knowledgeBase.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    
    // 保存文件
    await fs.writeJson(KNOWLEDGE_BASE_FILE, knowledgeBase, { spaces: 2 });
    
    // 创建详情文件
    const detailFile = path.join(DETAILS_DIR, `${detailId}.md`);
    await fs.writeFile(detailFile, detailContent);
    
    console.log('\n✅ 数据添加成功!');
    console.log('==================');
    console.log(`📁 知识库文件已更新: ${KNOWLEDGE_BASE_FILE}`);
    console.log(`📄 详情文件已创建: ${detailFile}`);
    console.log(`🔗 详情ID: ${detailId}`);
    
    // 显示摘要
    console.log('\n📊 添加内容摘要:');
    console.log(`时间: ${timePoint}`);
    console.log(`行业: ${industry}`);
    console.log(`标题: ${title}`);
    console.log(`重要性: ${importance}`);
    console.log(`标签: ${tags.join(', ') || '无'}`);
    console.log(`详情ID: ${detailId}`);
    
    console.log('\n💡 提示: 你可以通过以下方式继续管理数据:');
    console.log('1. 再次运行此脚本添加更多内容');
    console.log('2. 使用智能数据管理工具: tools/smart-data-manager.html');
    console.log('3. 直接在知识库网站中查看新添加的内容');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.log('\n🔧 故障排除:');
    console.log('1. 确保服务器正在运行');
    console.log('2. 检查数据文件是否存在');
    console.log('3. 验证时间格式是否正确');
  } finally {
    rl.close();
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { main, getCurrentWeek, getNextWeek, generateDetailId }; 