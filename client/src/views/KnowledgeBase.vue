<template>
  <div class="knowledge-base">
    <!-- 头部区域 -->
    <header class="header">
      <div class="container">
        <h1 class="title">
          <el-icon class="title-icon"><DataAnalysis /></el-icon>
          知识库展示系统
        </h1>
        <p class="subtitle">按时间与行业维度组织的信息管理平台</p>
      </div>
    </header>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="container">
        <el-row :gutter="20" align="middle">
          <el-col :span="6">
            <el-select
              v-model="selectedIndustry"
              placeholder="选择行业"
              clearable
              @change="applyFilters"
              style="width: 100%"
            >
              <el-option
                v-for="industry in industries"
                :key="industry"
                :label="industry"
                :value="industry"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="selectedTimePoint"
              placeholder="选择时间点"
              clearable
              @change="applyFilters"
              style="width: 100%"
            >
              <el-option
                v-for="timePoint in timePoints"
                :key="timePoint"
                :label="formatTimePoint(timePoint)"
                :value="timePoint"
              />
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

    <!-- 主表格区域 -->
    <main class="main-content">
      <div class="container">
        <el-card class="table-card" shadow="never">
          <!-- 表格工具栏 -->
          <template #header>
            <div class="table-toolbar">
              <div class="table-info">
                <span>共 {{ filteredTimePoints.length }} 个时间点 × {{ filteredIndustries.length }} 个行业</span>
                <span class="content-count">已填充内容: {{ getContentCount() }} 项</span>
              </div>
              <div class="table-controls">
                <el-button size="small" @click="resetTableView">
                  <el-icon><Refresh /></el-icon>
                  重置视图
                </el-button>
                <el-button size="small" @click="exportData">
                  <el-icon><Download /></el-icon>
                  导出数据
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="table-wrapper" v-loading="loading">
            <div class="table-scroll-container" ref="tableContainer">
              <!-- 水平滚动提示 -->
              <div class="scroll-hint" v-if="filteredIndustries.length > 3">
                <el-icon><ArrowLeft /></el-icon>
                <span>可左右滑动查看更多行业</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
              
              <table class="knowledge-table">
                <thead class="table-header-sticky">
                  <tr>
                    <th class="time-header sticky-left">
                      <div class="header-content">
                        <el-icon><Calendar /></el-icon>
                        <span>时间/行业</span>
                      </div>
                    </th>
                    <th 
                      v-for="industry in filteredIndustries" 
                      :key="industry"
                      class="industry-header"
                    >
                      <div class="header-content">
                        <span>{{ industry }}</span>
                        <div class="industry-stats">
                          {{ getIndustryContentCount(industry) }} 项
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="timePoint in filteredTimePoints" :key="timePoint">
                    <td class="time-cell sticky-left">
                      <div class="time-label">
                        <div class="time-main">{{ formatTimePoint(timePoint) }}</div>
                        <div class="time-stats">{{ getTimePointContentCount(timePoint) }} 项</div>
                      </div>
                    </td>
                    <td 
                      v-for="industry in filteredIndustries" 
                      :key="industry"
                      class="content-cell"
                      :class="{ 'has-content': getCellContent(timePoint, industry) }"
                      @click="openDetail(timePoint, industry)"
                    >
                      <div v-if="getCellContent(timePoint, industry)" class="cell-content">
                        <div class="content-title">
                          {{ getCellContent(timePoint, industry).title }}
                        </div>
                        <div class="content-summary">
                          {{ getCellContent(timePoint, industry).summary }}
                        </div>
                        <div class="content-tags">
                          <el-tag 
                            v-for="tag in getCellContent(timePoint, industry).tags" 
                            :key="tag"
                            size="small"
                            type="info"
                          >
                            {{ tag }}
                          </el-tag>
                        </div>
                        <div 
                          class="importance-indicator"
                          :class="getCellContent(timePoint, industry).importance"
                        ></div>
                      </div>
                      <div v-else class="empty-cell">
                        <el-icon><Plus /></el-icon>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </el-card>
      </div>
    </main>

    <!-- 详情侧边栏 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      size="40%"
      :before-close="closeDrawer"
    >
      <div class="detail-content" v-loading="detailLoading">
        <div v-if="detailContent" v-html="formatMarkdown(detailContent)"></div>
        <div v-else class="no-detail">
          <el-empty description="暂无详细内容" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'KnowledgeBase',
  data() {
    return {
      loading: true,
      detailLoading: false,
      knowledgeData: null,
      industries: [],
      timePoints: [],
      selectedIndustry: '',
      selectedTimePoint: '',
      searchKeyword: '',
      drawerVisible: false,
      drawerTitle: '',
      detailContent: '',
      currentDetailId: ''
    }
  },
  computed: {
    filteredIndustries() {
      if (this.selectedIndustry) {
        return [this.selectedIndustry]
      }
      return this.industries
    },
    filteredTimePoints() {
      if (this.selectedTimePoint) {
        return [this.selectedTimePoint]
      }
      return this.timePoints
    }
  },
  async mounted() {
    await this.loadKnowledgeBase()
  },
  methods: {
    async loadKnowledgeBase() {
      try {
        this.loading = true
        const response = await api.get('/knowledge-base')
        this.knowledgeData = response.data
        this.industries = response.data.industries || []
        this.timePoints = response.data.timePoints || []
      } catch (error) {
        console.error('加载知识库失败:', error)
        this.$message.error('加载知识库数据失败')
      } finally {
        this.loading = false
      }
    },
    
    getCellContent(timePoint, industry) {
      if (!this.knowledgeData?.content?.[timePoint]?.[industry]) {
        return null
      }
      
      const content = this.knowledgeData.content[timePoint][industry]
      
      // 应用搜索过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        const searchableText = `${content.title} ${content.summary} ${content.tags?.join(' ') || ''}`.toLowerCase()
        if (!searchableText.includes(keyword)) {
          return null
        }
      }
      
      return content
    },
    
    formatTimePoint(timePoint) {
      // 新格式已经是 "2025年1月第1周"，直接返回
      return timePoint
    },
    
    async openDetail(timePoint, industry) {
      const content = this.getCellContent(timePoint, industry)
      if (!content) return
      
      this.drawerTitle = `${this.formatTimePoint(timePoint)} - ${industry}`
      this.drawerVisible = true
      this.detailLoading = true
      
      try {
                  const response = await api.get(`/detail/${content.detailId}`)
        this.detailContent = response.data.content
        this.currentDetailId = content.detailId
      } catch (error) {
        console.error('加载详情失败:', error)
        this.$message.error('加载详情内容失败')
        this.detailContent = ''
      } finally {
        this.detailLoading = false
      }
    },
    
    closeDrawer() {
      this.drawerVisible = false
      this.detailContent = ''
      this.currentDetailId = ''
    },
    
    formatMarkdown(content) {
      // 简单的markdown转HTML
      return content
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br>')
    },
    
    applyFilters() {
      // 筛选逻辑已在computed属性中处理
    },
    
    resetFilters() {
      this.selectedIndustry = ''
      this.selectedTimePoint = ''
      this.searchKeyword = ''
    },
    
    resetTableView() {
      this.resetFilters()
      if (this.$refs.tableContainer) {
        this.$refs.tableContainer.scrollTop = 0
        this.$refs.tableContainer.scrollLeft = 0
      }
    },
    
    getContentCount() {
      let count = 0
      this.filteredTimePoints.forEach(timePoint => {
        this.filteredIndustries.forEach(industry => {
          if (this.getCellContent(timePoint, industry)) {
            count++
          }
        })
      })
      return count
    },
    
    getIndustryContentCount(industry) {
      let count = 0
      this.filteredTimePoints.forEach(timePoint => {
        if (this.getCellContent(timePoint, industry)) {
          count++
        }
      })
      return count
    },
    
    getTimePointContentCount(timePoint) {
      let count = 0
      this.filteredIndustries.forEach(industry => {
        if (this.getCellContent(timePoint, industry)) {
          count++
        }
      })
      return count
    },
    
    exportData() {
      // 导出当前筛选的数据为JSON
      const exportData = {
        metadata: {
          exportTime: new Date().toISOString(),
          timePoints: this.filteredTimePoints.length,
          industries: this.filteredIndustries.length,
          contentCount: this.getContentCount()
        },
        timePoints: this.filteredTimePoints,
        industries: this.filteredIndustries,
        content: {}
      }
      
      this.filteredTimePoints.forEach(timePoint => {
        exportData.content[timePoint] = {}
        this.filteredIndustries.forEach(industry => {
          const content = this.getCellContent(timePoint, industry)
          if (content) {
            exportData.content[timePoint][industry] = content
          }
        })
      })
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      this.$message.success('数据导出成功')
    }
  }
}
</script>

<style scoped>
.knowledge-base {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部样式 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 2.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 筛选区域 */
.filter-section {
  background: white;
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 主内容区域 */
.main-content {
  padding: 30px 0;
}

.table-card {
  border-radius: 12px;
  overflow: hidden;
}

/* 表格工具栏 */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.table-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.content-count {
  color: #409eff;
  font-weight: 600;
}

.table-controls {
  display: flex;
  gap: 10px;
}

/* 表格容器优化 */
.table-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.table-scroll-container {
  overflow: auto;
  max-height: calc(100vh - 320px);
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

/* 滚动提示 */
.scroll-hint {
  position: sticky;
  top: 0;
  z-index: 50;
  background: linear-gradient(90deg, #e6f3ff 0%, #f0f9ff 50%, #e6f3ff 100%);
  padding: 8px 15px;
  text-align: center;
  font-size: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* 固定表头和首列 */
.table-header-sticky {
  position: sticky;
  top: 0;
  z-index: 30;
}

.sticky-left {
  position: sticky;
  left: 0;
  z-index: 20;
  background: white !important;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
}

/* 表格样式 */
.knowledge-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
}

.knowledge-table th,
.knowledge-table td {
  border: 1px solid #e4e7ed;
  padding: 0;
}

.time-header,
.industry-header {
  background: #f8f9fa;
  padding: 15px;
  font-weight: 600;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.time-header {
  width: 140px;
  background: #e6f3ff !important;
  position: relative;
}

.industry-header {
  min-width: 200px;
  background: #f0f9ff;
  position: relative;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.industry-stats {
  font-size: 11px;
  color: #909399;
  font-weight: normal;
}

.time-cell {
  background: #fafbfc !important;
  padding: 0;
  vertical-align: middle;
  width: 140px;
}

.time-label {
  padding: 15px 10px;
  text-align: center;
  font-size: 12px;
}

.time-main {
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.time-stats {
  font-size: 10px;
  color: #909399;
}

.content-cell {
  width: 200px;
  height: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  position: relative;
}

.content-cell:hover {
  background-color: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.content-cell.has-content {
  background: white;
}

.cell-content {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.content-title {
  font-weight: 600;
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-summary {
  font-size: 12px;
  color: #606266;
  line-height: 1.3;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 5px;
}

.content-tags .el-tag {
  font-size: 10px;
  height: 18px;
  line-height: 16px;
  padding: 0 5px;
}

.importance-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.importance-indicator.high {
  background-color: #f56c6c;
}

.importance-indicator.medium {
  background-color: #e6a23c;
}

.importance-indicator.low {
  background-color: #67c23a;
}

.empty-cell {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 24px;
}

/* 详情侧边栏样式 */
.detail-content {
  padding: 20px;
  line-height: 1.8;
}

.detail-content :deep(h1) {
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.detail-content :deep(h2) {
  color: #409eff;
  margin: 25px 0 15px 0;
}

.detail-content :deep(h3) {
  color: #606266;
  margin: 20px 0 10px 0;
}

.detail-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.detail-content :deep(th),
.detail-content :deep(td) {
  border: 1px solid #e4e7ed;
  padding: 8px 12px;
  text-align: left;
}

.detail-content :deep(th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

.detail-content :deep(li) {
  margin: 5px 0;
  list-style-type: disc;
  margin-left: 20px;
}

.no-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }
  
  .filter-section .el-col {
    margin-bottom: 10px;
  }
  
  .knowledge-table {
    font-size: 12px;
  }
  
  .content-cell {
    width: 180px;
    height: 100px;
  }
}
</style> 