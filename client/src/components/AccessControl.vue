<template>
  <div class="access-control" v-if="!isAuthenticated">
    <div class="login-container">
      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <h2>访问验证</h2>
            <p>请输入访问密码</p>
          </div>
        </template>
        
        <el-form @submit.prevent="authenticate">
          <el-form-item>
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入访问密码"
              show-password
              size="large"
              @keyup.enter="authenticate"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="authenticate"
              size="large"
              :loading="loading"
              style="width: 100%"
            >
              验证访问
            </el-button>
          </el-form-item>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
  
  <div v-else>
    <slot></slot>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AccessControl',
  setup() {
    const isAuthenticated = ref(false)
    const password = ref('')
    const loading = ref(false)
    const error = ref('')
    
    // 这里可以设置多个密码，或者从环境变量中读取
    const validPasswords = [
      'your-secret-password-2024',
      'access-key-123',
      'private-site-pass'
    ]
    
    // 检查本地存储中的认证状态
    onMounted(() => {
      const storedAuth = localStorage.getItem('site-authenticated')
      const authTime = localStorage.getItem('auth-time')
      
      if (storedAuth && authTime) {
        const timeDiff = Date.now() - parseInt(authTime)
        // 认证有效期24小时
        if (timeDiff < 24 * 60 * 60 * 1000) {
          isAuthenticated.value = true
        } else {
          localStorage.removeItem('site-authenticated')
          localStorage.removeItem('auth-time')
        }
      }
    })
    
    const authenticate = () => {
      if (!password.value.trim()) {
        error.value = '请输入密码'
        return
      }
      
      loading.value = true
      error.value = ''
      
      // 模拟验证延迟
      setTimeout(() => {
        if (validPasswords.includes(password.value.trim())) {
          isAuthenticated.value = true
          localStorage.setItem('site-authenticated', 'true')
          localStorage.setItem('auth-time', Date.now().toString())
          ElMessage.success('验证成功，欢迎访问！')
        } else {
          error.value = '密码错误，请重试'
          password.value = ''
        }
        loading.value = false
      }, 1000)
    }
    
    return {
      isAuthenticated,
      password,
      loading,
      error,
      authenticate
    }
  }
}
</script>

<style scoped>
.access-control {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.card-header h2 {
  color: #333;
  margin-bottom: 8px;
}

.card-header p {
  color: #666;
  margin: 0;
}

.error-message {
  color: #f56565;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

:deep(.el-card__header) {
  padding: 20px 20px 0;
}
</style> 