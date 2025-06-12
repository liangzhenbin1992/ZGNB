const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 检查构建环境...');
console.log('Node.js 版本:', process.version);
console.log('当前目录:', process.cwd());

// 检查 package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ package.json 存在');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('📦 依赖数量:', Object.keys(pkg.dependencies || {}).length);
} else {
  console.log('❌ package.json 不存在');
}

// 检查 node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules 存在');
} else {
  console.log('❌ node_modules 不存在');
}

// 检查 vite 是否可用
try {
  const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite');
  if (fs.existsSync(vitePath)) {
    console.log('✅ Vite 可执行文件存在');
  } else {
    console.log('❌ Vite 可执行文件不存在');
  }
} catch (error) {
  console.log('❌ 检查 Vite 时出错:', error.message);
}

console.log('🏗️ 开始构建...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ 构建成功！');
} catch (error) {
  console.log('❌ 构建失败:', error.message);
  process.exit(1);
} 