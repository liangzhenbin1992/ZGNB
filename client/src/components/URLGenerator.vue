<template>
  <div class="url-generator">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>动态访问链接生成器</h3>
          <p>为特定用户生成临时访问链接</p>
        </div>
      </template>
      
      <el-form :model="form" label-width="120px">
        <el-form-item label="链接有效期">
          <el-select v-model="form.expiry" placeholder="选择有效期">
            <el-option label="1小时" value="1h"></el-option>
            <el-option label="6小时" value="6h"></el-option>
            <el-option label="24小时" value="24h"></el-option>
            <el-option label="7天" value="7d"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="访问次数限制">
          <el-input-number 
            v-model="form.maxUses" 
            :min="1" 
            :max="100"
            placeholder="最大使用次数"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="form.note" 
            placeholder="为这个链接添加备注（可选）"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="generateURL">
            生成访问链接
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="generatedLinks.length > 0" class="generated-links">
        <el-divider>已生成的链接</el-divider>
        <div v-for="link in generatedLinks" :key="link.id" class="link-item">
          <el-card class="link-card">
            <div class="link-info">
              <div class="link-url">
                <el-input 
                  :value="link.url" 
                  readonly
                  @click="copyToClipboard(link.url)"
                >
                  <template #append>
                    <el-button @click="copyToClipboard(link.url)">
                      复制
                    </el-button>
                  </template>
                </el-input>
              </div>
              <div class="link-details">
                <span class="detail-item">
                  <strong>过期时间:</strong> {{ formatDate(link.expiry) }}
                </span>
                <span class="detail-item">
                  <strong>剩余次数:</strong> {{ link.remainingUses }}/{{ link.maxUses }}
                </span>
                <span v-if="link.note" class="detail-item">
                  <strong>备注:</strong> {{ link.note }}
                </span>
              </div>
            </div>
            <div class="link-actions">
              <el-button type="danger" size="small" @click="revokeLink(link.id)">
                撤销链接
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'URLGenerator',
  setup() {
    const form = ref({
      expiry: '24h',
      maxUses: 5,
      note: ''
    })
    
    const generatedLinks = ref([])
    
    onMounted(() => {
      loadStoredLinks()
    })
    
    const generateURL = () => {
      const linkId = generateLinkId()
      const currentTime = Date.now()
      const expiryTime = calculateExpiryTime(form.value.expiry)
      
      const newLink = {
        id: linkId,
        url: `${window.location.origin}${window.location.pathname}?access=${linkId}`,
        expiry: expiryTime,
        maxUses: form.value.maxUses,
        remainingUses: form.value.maxUses,
        note: form.value.note,
        created: currentTime
      }
      
      generatedLinks.value.unshift(newLink)
      saveLinksToStorage()
      
      ElMessage.success('访问链接已生成！')
    }
    
    const generateLinkId = () => {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15)
    }
    
    const calculateExpiryTime = (expiry) => {
      const current = Date.now()
      const multipliers = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      }
      return current + multipliers[expiry]
    }
    
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('链接已复制到剪贴板')
      } catch (err) {
        ElMessage.error('复制失败，请手动复制')
      }
    }
    
    const revokeLink = (linkId) => {
      generatedLinks.value = generatedLinks.value.filter(link => link.id !== linkId)
      saveLinksToStorage()
      ElMessage.success('链接已撤销')
    }
    
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString('zh-CN')
    }
    
    const resetForm = () => {
      form.value = {
        expiry: '24h',
        maxUses: 5,
        note: ''
      }
    }
    
    const saveLinksToStorage = () => {
      localStorage.setItem('generated-links', JSON.stringify(generatedLinks.value))
    }
    
    const loadStoredLinks = () => {
      const stored = localStorage.getItem('generated-links')
      if (stored) {
        const links = JSON.parse(stored)
        // 过滤掉已过期的链接
        generatedLinks.value = links.filter(link => link.expiry > Date.now())
        if (generatedLinks.value.length !== links.length) {
          saveLinksToStorage()
        }
      }
    }
    
    return {
      form,
      generatedLinks,
      generateURL,
      copyToClipboard,
      revokeLink,
      formatDate,
      resetForm
    }
  }
}
</script>

<style scoped>
.url-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  text-align: center;
}

.generated-links {
  margin-top: 20px;
}

.link-item {
  margin-bottom: 15px;
}

.link-card {
  border: 1px solid #e0e0e0;
}

.link-info {
  margin-bottom: 15px;
}

.link-url {
  margin-bottom: 10px;
}

.link-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.detail-item {
  display: inline-block;
}

.link-actions {
  text-align: right;
}

:deep(.el-input-group__append) {
  cursor: pointer;
}
</style> 