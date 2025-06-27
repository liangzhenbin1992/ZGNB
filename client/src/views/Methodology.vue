<template>
  <div class="methodology-container">
    <!-- 头部区域 -->
    <header class="header">
      <div class="container">
        <h1 class="title">
          <el-icon class="title-icon"><Document /></el-icon>
          思路方法论系统
        </h1>
        <p class="subtitle">按分类与难度组织的思维方法、分析框架和实践经验</p>
      </div>
    </header>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="container">
        <el-row :gutter="20" align="middle">
          <el-col :span="6">
            <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              clearable
              @change="applyFilters"
              style="width: 100%"
            >
              <el-option
                v-for="category in categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="selectedDifficulty"
              placeholder="选择难度等级"
              clearable
              @change="applyFilters"
              style="width: 100%"
            >
              <el-option label="入门级" value="beginner" />
              <el-option label="中级" value="intermediate" />
              <el-option label="高级" value="advanced" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索关键词"
              clearable
              @input="applyFilters"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置筛选
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ filteredMethodologies.length }}</span>
        <span class="stat-label">个方法论</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ categories.length }}</span>
        <span class="stat-label">个分类</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ getTotalViews() }}</span>
        <span class="stat-label">总浏览</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area" v-loading="loading">
      <!-- 分类标签栏 -->
      <div class="category-tabs">
        <el-tag
          v-for="category in categories"
          :key="category"
          :type="selectedCategory === category ? 'primary' : 'info'"
          :effect="selectedCategory === category ? 'dark' : 'plain'"
          size="large"
          class="category-tag"
          @click="toggleCategory(category)"
        >
          {{ category }}
          <span class="category-count">({{ getCategoryCount(category) }})</span>
        </el-tag>
      </div>

      <!-- 方法论卡片网格 -->
      <div class="methodology-grid">
        <div
          v-for="item in filteredMethodologies"
          :key="item.id"
          class="methodology-card"
          @click="openDetail(item)"
        >
          <div class="card-header">
            <div class="card-category">
              <el-tag :type="getCategoryTagType(item.category)" size="small">
                {{ item.category }}
              </el-tag>
            </div>
            <div class="card-difficulty">
              <el-tag
                :type="getDifficultyTagType(item.difficulty)"
                size="small"
                effect="plain"
              >
                {{ getDifficultyLabel(item.difficulty) }}
              </el-tag>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-summary">{{ item.summary }}</p>
            
            <div class="card-tags">
              <el-tag
                v-for="tag in item.tags.slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
              <el-tag
                v-if="item.tags.length > 3"
                size="small"
                type="info"
                effect="plain"
              >
                +{{ item.tags.length - 3 }}
              </el-tag>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="card-meta">
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ item.views || 0 }}
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(item.updatedAt) }}
              </span>
            </div>
            
            <div class="card-rating">
              <el-rate
                :model-value="item.rating || 3"
                disabled
                show-score
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredMethodologies.length === 0" class="empty-state">
        <el-empty description="暂无相关内容" />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      size="60%"
      class="detail-drawer"
    >
      <div v-loading="detailLoading" class="drawer-content">
        <div v-if="!detailLoading && currentItem" class="detail-content">
          <!-- 详情头部 -->
          <div class="detail-header">
            <div class="detail-meta">
              <el-tag :type="getCategoryTagType(currentItem.category)">
                {{ currentItem.category }}
              </el-tag>
              <el-tag
                :type="getDifficultyTagType(currentItem.difficulty)"
                effect="plain"
              >
                {{ getDifficultyLabel(currentItem.difficulty) }}
              </el-tag>
              <span class="detail-date">
                更新于 {{ formatDate(currentItem.updatedAt) }}
              </span>
            </div>
            
            <!-- 操作按钮区域 -->
            <div class="detail-actions">
              <el-button type="primary" @click="openInNewPage" size="small">
                <el-icon><Link /></el-icon>
                在新页面打开
              </el-button>
            </div>
            
            <div class="detail-tags">
              <el-tag
                v-for="tag in currentItem.tags"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 详情内容 -->
          <div class="detail-body">
            <div class="content-section">
              <h4>概述</h4>
              <p>{{ currentItem.summary }}</p>
            </div>
            
            <div class="content-section">
              <h4>详细内容</h4>
              <div v-html="formatMarkdown(detailContent)" class="markdown-content"></div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Calendar, Document, Link } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'Methodology',
  components: {
    Search,
    Refresh,
    View,
    Calendar,
    Document,
    Link
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const detailLoading = ref(false)
    const methodologies = ref([])
    const categories = ref([])
    const searchKeyword = ref('')
    const selectedCategory = ref('')
    const selectedDifficulty = ref('')
    const drawerVisible = ref(false)
    const drawerTitle = ref('')
    const detailContent = ref('')
    const currentItem = ref(null)

    // 计算属性
    const filteredMethodologies = computed(() => {
      let result = methodologies.value

      // 分类筛选
      if (selectedCategory.value) {
        result = result.filter(item => item.category === selectedCategory.value)
      }

      // 难度筛选
      if (selectedDifficulty.value) {
        result = result.filter(item => item.difficulty === selectedDifficulty.value)
      }

      // 关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        result = result.filter(item => {
          const searchableText = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase()
          return searchableText.includes(keyword)
        })
      }

      return result
    })

    // 生命周期
    onMounted(() => {
      loadMethodologies()
    })

    // 方法
    const loadMethodologies = async () => {
      try {
        loading.value = true
        const response = await axios.get('/api/methodologies')
        methodologies.value = response.data.methodologies || []
        categories.value = response.data.categories || []
      } catch (error) {
        console.error('加载方法论失败:', error)
        ElMessage.error('加载数据失败')
        
        // 临时模拟数据
        methodologies.value = getMockData()
        categories.value = getMockCategories()
      } finally {
        loading.value = false
      }
    }

    const openDetail = async (item) => {
      currentItem.value = item
      drawerTitle.value = item.title
      drawerVisible.value = true
      detailLoading.value = true

      try {
        const response = await axios.get(`/api/methodology-detail/${item.id}`)
        detailContent.value = response.data.content
      } catch (error) {
        console.error('加载详情失败:', error)
        detailContent.value = getMockContent(item)
      } finally {
        detailLoading.value = false
      }
    }

    const toggleCategory = (category) => {
      selectedCategory.value = selectedCategory.value === category ? '' : category
    }

    const applyFilters = () => {
      // 过滤逻辑已经在计算属性filteredMethodologies中处理
      // 这个方法主要用于手动触发过滤
    }

    const resetFilters = () => {
      searchKeyword.value = ''
      selectedCategory.value = ''
      selectedDifficulty.value = ''
    }

    const getCategoryCount = (category) => {
      return methodologies.value.filter(item => item.category === category).length
    }

    const getTotalViews = () => {
      return methodologies.value.reduce((total, item) => total + (item.views || 0), 0)
    }

    const getCategoryTagType = (category) => {
      const typeMap = {
        '产品设计': 'primary',
        '技术架构': 'success',
        '管理方法': 'warning',
        '分析框架': 'info',
        '创新思维': 'danger',
        '商业模式': 'primary',
        '用户研究': 'success',
        '数据分析': 'info'
      }
      return typeMap[category] || 'info'
    }

    const getDifficultyTagType = (difficulty) => {
      const typeMap = {
        'beginner': 'success',
        'intermediate': 'warning',
        'advanced': 'danger'
      }
      return typeMap[difficulty] || 'info'
    }

    const getDifficultyLabel = (difficulty) => {
      const labelMap = {
        'beginner': '入门',
        'intermediate': '中级',
        'advanced': '高级'
      }
      return labelMap[difficulty] || '未知'
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    const formatMarkdown = (content) => {
      return content
        .replace(/^# (.*$)/gim, '<h1 style="color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 12px; margin-bottom: 20px; font-size: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="color: #764ba2; margin-top: 30px; margin-bottom: 15px; font-size: 24px; font-weight: 700;">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 15px auto; display: block; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);" />')
        .replace(/\n/gim, '<br>')
    }

    // 在新页面打开文章详情
    const openInNewPage = () => {
      if (!currentItem.value) {
        console.error('当前文章数据为空')
        ElMessage.error('当前文章数据为空，无法打开新页面')
        return
      }
      
      console.log('准备在新页面打开文章:', currentItem.value.title)
      console.log('当前文章数据:', currentItem.value)
      console.log('详细内容长度:', detailContent.value ? detailContent.value.length : 0)
      
      try {
        // 生成唯一的存储键
        const storageKey = `methodology_detail_${currentItem.value.id}_${Date.now()}`
        
        // 准备数据
        const routeData = {
          item: currentItem.value,
          content: detailContent.value || getMockContent(currentItem.value)
        }
        
        // 将数据存储到 sessionStorage
        sessionStorage.setItem(storageKey, JSON.stringify(routeData))
        
        console.log('数据已存储到 sessionStorage，键:', storageKey)
        
        // 生成URL，通过路径参数传递存储键
        const url = router.resolve({
          name: 'MethodologyDetail',
          params: { id: currentItem.value.id },
          query: { key: storageKey }
        }).href
        
        console.log('生成的URL:', url)
        
        // 在新标签页中打开
        window.open(url, '_blank')
        ElMessage.success('正在新页面中打开文章...')
        
      } catch (error) {
        console.error('打开新页面失败:', error)
        ElMessage.error('打开新页面失败，请重试')
      }
    }

    // 模拟数据
    const getMockCategories = () => [
      '产品设计', '技术架构', '管理方法', '分析框架', 
      '创新思维', '商业模式', '用户研究', '数据分析'
    ]

    const getMockData = () => [
      {
        id: 'prod_design_001',
        category: '产品设计',
        title: '用户故事地图方法',
        summary: '通过用户故事地图来梳理产品功能优先级和用户旅程的系统性方法',
        difficulty: 'intermediate',
        tags: ['用户体验', '产品规划', '敏捷开发', '用户旅程'],
        views: 1250,
        rating: 4.5,
        updatedAt: '2024-01-15'
      },
      {
        id: 'tech_arch_001',
        category: '技术架构',
        title: '微服务架构设计原则',
        summary: '构建可扩展、高可用微服务系统的核心设计原则和最佳实践',
        difficulty: 'advanced',
        tags: ['微服务', '系统设计', '架构', '可扩展性'],
        views: 2100,
        rating: 4.8,
        updatedAt: '2024-01-12'
      },
      {
        id: 'manage_001',
        category: '管理方法',
        title: 'OKR目标管理法',
        summary: '通过OKR（目标与关键结果）来实现团队目标对齐和高效执行',
        difficulty: 'beginner',
        tags: ['目标管理', 'OKR', '团队协作', '绩效管理'],
        views: 890,
        rating: 4.2,
        updatedAt: '2024-01-10'
      },
      {
        id: 'analysis_001',
        category: '分析框架',
        title: 'SWOT分析法',
        summary: '系统分析优势、劣势、机会、威胁的经典战略分析工具',
        difficulty: 'beginner',
        tags: ['战略分析', 'SWOT', '竞争分析', '决策工具'],
        views: 1560,
        rating: 4.0,
        updatedAt: '2024-01-08'
      },
      {
        id: 'innovation_001',
        category: '创新思维',
        title: '设计思维流程',
        summary: '以用户为中心的创新问题解决方法论，包含同理心、定义、构思、原型、测试五个阶段',
        difficulty: 'intermediate',
        tags: ['设计思维', '创新', '用户中心', '原型设计'],
        views: 1780,
        rating: 4.6,
        updatedAt: '2024-01-05'
      },
      {
        id: 'business_001',
        category: '商业模式',
        title: '商业模式画布',
        summary: '用9个构建块来描述和分析商业模式的可视化工具',
        difficulty: 'intermediate',
        tags: ['商业模式', '画布', '价值主张', '商业分析'],
        views: 2340,
        rating: 4.7,
        updatedAt: '2024-01-03'
      },
      {
        id: 'research_001',
        category: '用户研究',
        title: '用户访谈技巧',
        summary: '如何进行有效的用户访谈，获取真实有价值的用户洞察',
        difficulty: 'beginner',
        tags: ['用户访谈', '定性研究', '用户洞察', '调研方法'],
        views: 920,
        rating: 4.3,
        updatedAt: '2024-01-01'
      },
      {
        id: 'data_001',
        category: '数据分析',
        title: '数据驱动决策框架',
        summary: '建立数据驱动的决策机制，从数据收集到洞察应用的完整流程',
        difficulty: 'advanced',
        tags: ['数据分析', '决策框架', '数据驱动', '商业智能'],
        views: 1650,
        rating: 4.4,
        updatedAt: '2023-12-28'
      }
    ]

    const getMockContent = (item) => {
      return `# ${item.title}

## 概述
${item.summary}

## 适用场景
这个方法论适用于以下场景：
- 场景一：具体的应用情况描述
- 场景二：另一种典型的使用场景
- 场景三：高级应用场景

## 核心步骤

### 步骤1：准备阶段
详细描述第一个步骤的具体操作和注意事项...

### 步骤2：执行阶段
详细描述第二个步骤的具体操作和注意事项...

### 步骤3：评估阶段
详细描述第三个步骤的具体操作和注意事项...

## 实践案例
通过具体的案例来说明这个方法论的实际应用效果...

## 注意事项
- 注意事项1
- 注意事项2
- 注意事项3

## 相关资源
- 推荐阅读1
- 推荐阅读2
- 相关工具推荐`
    }

    return {
      loading,
      detailLoading,
      methodologies,
      categories,
      filteredMethodologies,
      searchKeyword,
      selectedCategory,
      selectedDifficulty,
      drawerVisible,
      drawerTitle,
      detailContent,
      currentItem,
      loadMethodologies,
      openDetail,
      openInNewPage,
      toggleCategory,
      applyFilters,
      resetFilters,
      getCategoryCount,
      getTotalViews,
      getCategoryTagType,
      getDifficultyTagType,
      getDifficultyLabel,
      formatDate,
      formatMarkdown
    }
  }
}
</script>

<style scoped>
.methodology-container {
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
}

/* 头部区域 - 与知识库保持一致 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
}

.title-icon {
  font-size: 32px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* 筛选区域 - 与知识库保持一致 */
.filter-section {
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #e6e8eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 60px;
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e6e8eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 5px;
}

.content-area {
  background: #f5f7fa;
  padding: 30px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.category-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tag:hover {
  transform: translateY(-2px);
}

.category-count {
  margin-left: 5px;
  opacity: 0.8;
}

.methodology-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.methodology-card {
  border: 1px solid #e6e8eb;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.methodology-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-content {
  margin-bottom: 15px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  line-height: 1.4;
}

.card-summary {
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f5f6fa;
}

.card-meta {
  display: flex;
  gap: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #95a5a6;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.detail-drawer :deep(.el-drawer__body) {
  padding: 0;
}

.drawer-content {
  height: 100%;
  padding: 30px;
}

.detail-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.detail-date {
  font-size: 14px;
  color: #95a5a6;
}

.detail-actions {
  margin: 20px 0;
  text-align: right;
}

.detail-actions .el-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.25);
  height: auto;
  line-height: 1.6;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.detail-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6edf 0%, #6a3b9c 100%);
}

.detail-actions .el-button:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-body {
  line-height: 1.8;
}

.content-section {
  margin-bottom: 30px;
}

.content-section h4 {
  color: #2c3e50;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
}

.markdown-content {
  color: #34495e;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  color: #2c3e50;
  margin: 20px 0 15px;
}

.markdown-content li {
  margin: 8px 0;
  list-style-type: disc;
  margin-left: 20px;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  margin: 20px auto;
  display: block;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.markdown-content img:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .header {
    padding: 30px 0;
  }
  
  .title {
    font-size: 24px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .stats-bar {
    gap: 30px;
    padding: 16px 0;
  }
  
  .content-area {
    padding: 20px 16px;
  }
  
  .methodology-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .methodology-card {
    padding: 20px;
  }
}
</style> 