<template>
  <div class="methodology-detail-page">
    <!-- 头部区域 -->
    <header class="page-header">
      <div class="container">
        <div class="header-actions">
          <el-button @click="goBack" class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
        </div>
        
        <h1 class="page-title">{{ currentItem?.title || '加载中...' }}</h1>
      </div>
    </header>

    <!-- 文章内容区域 -->
    <div class="article-container" v-loading="loading">
      <div class="container">

        
        <div class="article-content" v-if="!loading && currentItem">
          <!-- 概述 -->
          <div class="content-section">
            <h2>概述</h2>
            <p class="summary-text">{{ currentItem.summary }}</p>
          </div>
          
          <!-- 详细内容 -->
          <div class="content-section">
            <h2>详细内容</h2>
            <div v-html="formatMarkdown(detailContent)" class="markdown-content"></div>
          </div>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="!loading && !currentItem" class="error-state">
          <h3>内容加载失败</h3>
          <p>{{ errorMessage || '无法获取文章数据，请返回重试。' }}</p>
          <el-button type="primary" @click="goBack">返回列表</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

export default {
  name: 'MethodologyDetail',
  components: {
    ArrowLeft
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const loading = ref(false)
    const currentItem = ref(null)
    const detailContent = ref('')
    const errorMessage = ref('')

    
    onMounted(() => {
      // 方法1: 从 sessionStorage 读取数据（推荐）
      if (route.query.key) {
        try {
          const storedData = sessionStorage.getItem(route.query.key)
          
          if (storedData) {
            const data = JSON.parse(storedData)
            
            if (data.item) {
              currentItem.value = data.item
            }
            
            if (data.content) {
              detailContent.value = data.content
            }
            
            // 清理 sessionStorage
            sessionStorage.removeItem(route.query.key)
            
          } else {
            throw new Error('sessionStorage 中没有找到数据')
          }
          
        } catch (error) {
          errorMessage.value = `读取数据失败: ${error.message}`
          // 尝试备用方法
          loadFallbackData()
        }
      }
      // 方法2: 从URL查询参数读取数据（备用）
      else if (route.query.data) {
        try {
          const rawData = decodeURIComponent(route.query.data)
          const data = JSON.parse(rawData)
          
          currentItem.value = data.item
          detailContent.value = data.content
          
        } catch (error) {
          errorMessage.value = `数据解析失败: ${error.message}`
          loadFallbackData()
        }
      }
      // 方法3: 备用数据加载
      else {
        loadFallbackData()
      }
    })
    
    // 加载备用数据
    const loadFallbackData = () => {
      const articleId = route.params.id
      if (articleId) {
        // 创建示例数据
        currentItem.value = {
          id: articleId,
          title: '文章标题',
          category: '示例分类',
          difficulty: 'intermediate',
          summary: '这是一个示例文章的概述内容。',
          tags: ['示例', '方法论'],
          updatedAt: '2024-01-15'
        }
        
        detailContent.value = `# ${currentItem.value.title}

## 概述
${currentItem.value.summary}

## 详细内容
这是文章的详细内容部分。由于数据传递出现问题，当前显示的是示例内容。

请返回文章列表重新尝试。

## 注意事项
- 如果您看到这个内容，说明数据传递出现了问题
- 请尝试关闭此页面并重新从列表中打开文章
- 如果问题持续存在，请联系技术支持`
        
        errorMessage.value = '使用了备用数据，可能不是完整内容'
      } else {
        errorMessage.value = '无法获取文章ID'
      }
    }
    
    const goBack = () => {
      router.push('/methodology')
    }
    
    const formatMarkdown = (content) => {
      return content
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 15px auto; display: block; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); cursor: pointer;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';" /><div style="display: none; text-align: center; padding: 20px; background: #f7fafc; border: 1px dashed #cbd5e0; color: #718096; margin: 15px auto;">图片加载失败: $1</div>')
        .replace(/\n/gim, '<br>')
    }
    
    return {
      route,
      loading,
      currentItem,
      detailContent,
      errorMessage,

      goBack,
      loadFallbackData,
      formatMarkdown
    }
  }
}
</script>

<style scoped>
.methodology-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 0 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-actions {
  margin-bottom: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
}

.article-container {
  background: white;
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.article-content {
  max-width: 800px;
  margin: 0 auto;
}

.content-section {
  margin-bottom: 40px;
}

.content-section h2 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.summary-text {
  font-size: 16px;
  line-height: 1.8;
  color: #4a5568;
}

.markdown-content {
  font-size: 16px;
  line-height: 1.8;
  color: #2d3748;
}

/* Markdown 内容样式增强 */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4 {
  color: #2d3748;
  font-weight: 600;
  margin: 30px 0 16px 0;
  line-height: 1.4;
}

.markdown-content h1 {
  font-size: 28px;
  border-bottom: 3px solid #667eea;
  padding-bottom: 12px;
}

.markdown-content h2 {
  font-size: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.markdown-content h3 {
  font-size: 20px;
  color: #4a5568;
}

.markdown-content h4 {
  font-size: 18px;
  color: #4a5568;
}

.markdown-content p {
  margin: 16px 0;
}

.markdown-content li {
  margin: 8px 0;
  margin-left: 20px;
  list-style-type: disc;
  color: #4a5568;
}

.markdown-content strong {
  font-weight: 600;
  color: #2d3748;
}

.markdown-content em {
  font-style: italic;
  color: #667eea;
}

.markdown-content img {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e2e8f0;
}

.markdown-content img:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.error-state h3 {
  color: #e53e3e;
  margin-bottom: 16px;
}

.error-state p {
  margin-bottom: 24px;
  font-size: 16px;
}


</style> 