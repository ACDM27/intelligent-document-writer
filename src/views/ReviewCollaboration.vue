<template>
  <div class="review-collab-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>审阅协作</h1>
        <p>AI智能检视 + 在线协作，确保文书质量</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateNew">
          <el-icon><Plus /></el-icon>
          新建协作
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">12</div>
            <div class="stat-label">待审阅文档</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <el-icon :size="32"><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">5</div>
            <div class="stat-label">协作中</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <el-icon :size="32"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">8</div>
            <div class="stat-label">待修复问题</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <el-icon :size="32"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">35</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="我创建的" name="created" />
        <el-tab-pane label="待我审阅" name="pending" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>
      <div class="filter-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文档标题"
          clearable
          style="width: 240px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="document-list">
      <div
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="doc-card"
        @click="handleViewDocument(doc)"
      >
        <div class="doc-header">
          <div class="doc-title-row">
            <h3>{{ doc.title }}</h3>
            <el-tag :type="getStatusType(doc.status)">{{ doc.status }}</el-tag>
          </div>
          <div class="doc-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ doc.creator }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ doc.createTime }}
            </span>
            <span class="meta-item">
              <el-icon><FolderOpened /></el-icon>
              {{ doc.type }}
            </span>
          </div>
        </div>

        <div class="doc-body">
          <!-- 合规分数 -->
          <div class="compliance-score">
            <div class="score-circle" :class="getScoreClass(doc.complianceScore)">
              <span class="score-value">{{ doc.complianceScore }}</span>
              <span class="score-label">分</span>
            </div>
            <div class="score-info">
              <div class="score-title">合规度评分</div>
              <div class="score-desc">{{ getScoreDesc(doc.complianceScore) }}</div>
            </div>
          </div>

          <!-- 问题列表 -->
          <div class="issues-summary">
            <div class="issues-title">
              <el-icon><Warning /></el-icon>
              检测到 {{ doc.issues.length }} 个问题
            </div>
            <div class="issues-tags">
              <el-tag
                v-for="issue in doc.issues.slice(0, 3)"
                :key="issue.id"
                :type="getSeverityType(issue.severity)"
                size="small"
              >
                {{ issue.title }}
              </el-tag>
              <el-tag v-if="doc.issues.length > 3" size="small" type="info">
                +{{ doc.issues.length - 3 }} 更多
              </el-tag>
            </div>
          </div>

          <!-- 协作者 -->
          <div class="collaborators">
            <div class="collab-title">协作者</div>
            <el-avatar-group :max="3">
              <el-avatar v-for="collab in doc.collaborators" :key="collab.name">
                {{ collab.name.substring(0, 1) }}
              </el-avatar>
            </el-avatar-group>
          </div>
        </div>

        <div class="doc-footer">
          <el-button size="small" @click.stop="handleViewDocument(doc)">
            <el-icon><View /></el-icon>
            查看详情
          </el-button>
          <el-button size="small" type="primary" @click.stop="handleStartReview(doc)">
            <el-icon><Edit /></el-icon>
            开始审阅
          </el-button>
          <el-button size="small" @click.stop="handleShare(doc)">
            <el-icon><Share /></el-icon>
            分享协作
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="filteredDocuments.length === 0" description="暂无文档" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import reviewData from '@/mock/review_data.json'

const router = useRouter()

// 数据
const documents = ref([])
const activeTab = ref('all')
const searchKeyword = ref('')

// 加载数据
onMounted(() => {
  documents.value = reviewData
})

// 过滤后的文档
const filteredDocuments = computed(() => {
  let result = documents.value

  // 按标签筛选
  if (activeTab.value === 'created') {
    result = result.filter(doc => doc.creator === '张教授')
  } else if (activeTab.value === 'pending') {
    result = result.filter(doc => doc.status === '审阅中')
  } else if (activeTab.value === 'completed') {
    result = result.filter(doc => doc.status === '已完成')
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(doc =>
      doc.title.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '审阅中': 'warning',
    '已完成': 'success',
    '待审阅': 'info'
  }
  return typeMap[status] || ''
}

// 获取分数等级
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-normal'
  return 'score-poor'
}

// 获取分数描述
const getScoreDesc = (score) => {
  if (score >= 90) return '优秀，可直接导出'
  if (score >= 80) return '良好，建议修复部分问题'
  if (score >= 70) return '一般，需要修复多个问题'
  return '较差，存在严重问题'
}

// 获取问题严重程度类型
const getSeverityType = (severity) => {
  const typeMap = {
    'error': 'danger',
    'warning': 'warning',
    'info': 'info'
  }
  return typeMap[severity] || ''
}

// 新建协作
const handleCreateNew = () => {
  ElMessage.info('跳转到智能创作台')
  router.push('/writer')
}

// 查看文档详情
const handleViewDocument = (doc) => {
  router.push(`/review/${doc.id}`)
}

// 开始审阅
const handleStartReview = (doc) => {
  router.push(`/review/${doc.id}?mode=edit`)
}

// 分享协作
const handleShare = (doc) => {
  ElMessage.success('协作链接已复制到剪贴板')
}
</script>

<style scoped>
.review-collab-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #303133;
}

.header-left p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 文档列表 */
.document-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

.doc-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.doc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.doc-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.doc-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.doc-title-row h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  flex: 1;
}

.doc-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

/* 文档主体 */
.doc-body {
  margin-bottom: 20px;
}

/* 合规分数 */
.compliance-score {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid;
  flex-shrink: 0;
}

.score-circle.score-excellent {
  border-color: #67C23A;
  background: #f0f9ff;
}

.score-circle.score-good {
  border-color: #409EFF;
  background: #ecf5ff;
}

.score-circle.score-normal {
  border-color: #E6A23C;
  background: #fdf6ec;
}

.score-circle.score-poor {
  border-color: #F56C6C;
  background: #fef0f0;
}

.score-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  margin-top: 4px;
}

.score-excellent .score-value,
.score-excellent .score-label {
  color: #67C23A;
}

.score-good .score-value,
.score-good .score-label {
  color: #409EFF;
}

.score-normal .score-value,
.score-normal .score-label {
  color: #E6A23C;
}

.score-poor .score-value,
.score-poor .score-label {
  color: #F56C6C;
}

.score-info {
  flex: 1;
}

.score-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.score-desc {
  font-size: 13px;
  color: #606266;
}

/* 问题列表 */
.issues-summary {
  margin-bottom: 16px;
}

.issues-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.issues-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 协作者 */
.collaborators {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collab-title {
  font-size: 13px;
  color: #909399;
}

/* 文档底部 */
.doc-footer {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
