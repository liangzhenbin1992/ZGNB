const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
// 增加请求体大小限制以支持Base64图片上传
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// 检查是否有构建后的文件，如果没有则使用源文件
const clientDistPath = path.join(__dirname, '../client/dist');
const clientSrcPath = path.join(__dirname, '../client');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else {
  console.log('📁 使用源文件目录: client/');
  app.use(express.static(clientSrcPath));
}

// API路由
app.use('/api', require('./routes/api'));

// 静态文件服务 - 前端应用
app.get('*', (req, res) => {
  const indexPath = fs.existsSync(clientDistPath) ? 
    path.join(__dirname, '../client/dist/index.html') : 
    path.join(__dirname, '../client/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('前端文件未找到');
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📚 知识库网站已启动`);
}); 