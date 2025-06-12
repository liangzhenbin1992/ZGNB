const path = require('path');

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    basePath: process.env.BASE_PATH || '/'
  },
  
  // 数据配置
  data: {
    dir: process.env.DATA_DIR || path.join(__dirname, 'data'),
    knowledgeBaseFile: 'knowledge-base.json',
    detailsDir: 'details'
  },
  
  // 安全配置
  security: {
    accessPassword: process.env.ACCESS_PASSWORD || null,
    allowedOrigins: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : ['*']
  },
  
  // 备份配置
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    interval: parseInt(process.env.BACKUP_INTERVAL) || 24, // 小时
    maxBackups: parseInt(process.env.MAX_BACKUPS) || 30
  }
}; 