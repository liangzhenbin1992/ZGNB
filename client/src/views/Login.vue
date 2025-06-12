<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>📚 知识库访问</h1>
        <p class="subtitle">请输入访问密码</p>
      </div>
      
      <div class="login-form">
        <el-form @submit.prevent="handleLogin">
          <el-form-item>
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入4位数字密码"
              maxlength="4"
              size="large"
              :show-password="true"
              @keyup.enter="handleLogin"
              autofocus
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              {{ loading ? '验证中...' : '访问知识库' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div v-if="errorMessage" class="error-message">
          <el-alert
            :title="errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
      
      <div class="login-footer">
        <p class="tips">
          <el-icon><InfoFilled /></el-icon>
          密码由管理员提供，请妥善保管
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, InfoFilled } from '@element-plus/icons-vue'
import api from '@/utils/api'

export default {
  name: 'Login',
  components: {
    Lock,
    InfoFilled
  },
  setup() {
    const password = ref('')
    const loading = ref(false)
    const errorMessage = ref('')

    const handleLogin = async () => {
      if (!password.value) {
        errorMessage.value = '请输入密码'
        return
      }

      if (password.value.length !== 4 || !/^\d{4}$/.test(password.value)) {
        errorMessage.value = '密码必须是4位数字'
        return
      }

      loading.value = true
      errorMessage.value = ''

      try {
        const response = await api.post('/auth/verify', {
          password: password.value
        })

        if (response.data.success) {
          // 保存token到localStorage（永久有效）
          localStorage.setItem('access_token', response.data.token)
          localStorage.setItem('authenticated', 'true')
          
          ElMessage.success('验证成功，正在进入知识库...')
          
          // 跳转到主页面
          window.location.href = '/'
        }
      } catch (error) {
        console.error('登录失败:', error)
        if (error.response && error.response.data) {
          errorMessage.value = error.response.data.error
        } else {
          errorMessage.value = '验证失败，请检查网络连接'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      password,
      loading,
      errorMessage,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-header h1 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  margin: 0 0 32px 0;
  font-size: 16px;
}

.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.error-message {
  margin-top: 16px;
}

.login-footer {
  border-top: 1px solid #ecf0f1;
  padding-top: 20px;
}

.tips {
  color: #95a5a6;
  font-size: 14px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 输入框样式增强 */
:deep(.el-input__inner) {
  height: 48px;
  font-size: 18px;
  text-align: center;
  letter-spacing: 8px;
}

:deep(.el-input-group__prepend),
:deep(.el-input-group__append) {
  background-color: #f8f9fa;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 10px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style> 