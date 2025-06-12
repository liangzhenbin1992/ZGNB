<template>
  <div id="app">
    <!-- 全局导航栏 -->
    <nav v-if="isAuthenticated && $route.path !== '/login'" class="global-nav">
      <div class="nav-container">
        <div class="nav-brand">
          📚 知识库系统
        </div>
        <div class="nav-actions">
          <el-button 
            type="text" 
            @click="handleLogout"
            class="logout-btn"
          >
            <el-icon><SwitchButton /></el-icon>
            退出系统
          </el-button>
        </div>
      </div>
    </nav>
    
    <!-- 主内容区域 -->
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SwitchButton } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    SwitchButton
  },
  setup() {
    const router = useRouter()
    
    const isAuthenticated = computed(() => {
      return localStorage.getItem('authenticated') === 'true'
    })
    
    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要退出知识库系统吗？',
          '退出确认',
          {
            confirmButtonText: '退出',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        
        // 清除本地存储
        localStorage.removeItem('access_token')
        localStorage.removeItem('authenticated')
        
        ElMessage.success('已安全退出')
        
        // 跳转到登录页
        router.push('/login')
      } catch {
        // 用户取消操作
      }
    }
    
    return {
      isAuthenticated,
      handleLogout
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 全局导航栏样式 */
.global-nav {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  color: #909399 !important;
  padding: 8px 16px !important;
}

.logout-btn:hover {
  color: #f56c6c !important;
  background-color: #fef0f0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-brand {
    font-size: 16px;
  }
  
  .logout-btn {
    padding: 6px 12px !important;
    font-size: 14px;
  }
}
</style> 