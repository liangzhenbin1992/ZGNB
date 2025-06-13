<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>ZGNB 知识管理系统</h1>
        </div>
        
        <div class="nav-menu">
          <router-link 
            to="/" 
            class="nav-tab"
            :class="{ active: $route.name === 'KnowledgeBase' }"
          >
            <div class="tab-content">
              <el-icon class="tab-icon"><Grid /></el-icon>
              <span class="tab-text">知识库</span>
            </div>
          </router-link>
          
          <router-link 
            to="/methodology" 
            class="nav-tab"
            :class="{ active: $route.name === 'Methodology' }"
          >
            <div class="tab-content">
              <el-icon class="tab-icon"><Document /></el-icon>
              <span class="tab-text">方法论</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { Grid, Document, Plus } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Grid,
    Document,
    Plus
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e6e8eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
}

.nav-brand h1 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  background: linear-gradient(45deg, #3498db, #2980b9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  align-items: center;
  position: relative;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
}

.nav-tab {
  position: relative;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.nav-tab .tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  position: relative;
}

.nav-tab .tab-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.nav-tab .tab-text {
  font-size: 14px;
  font-weight: 600;
}

.nav-tab:hover {
  color: #3498db;
  transform: translateY(-1px);
}

.nav-tab:hover .tab-icon {
  transform: scale(1.1);
}

.nav-tab.active {
  color: #3498db;
  background: white;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1);
}

.nav-tab.active .tab-icon {
  transform: scale(1.05);
}

.main-content {
  padding-top: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-brand h1 {
    font-size: 16px;
  }
  
  .nav-tab .tab-text {
    display: none;
  }
  
  .nav-tab .tab-content {
    padding: 10px 12px;
  }
}
</style> 