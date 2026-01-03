<template>
  <div class="history-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>历史记录</h1>
        <p>查看您的操作历史和文档创建记录</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleClearHistory">
          <el-icon><Delete /></el-icon>
          清空历史
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="创建文档" name="创建文档" />
        <el-tab-pane label="编辑文档" name="编辑文档" />
        <el-tab-pane label="审阅协作" name="审阅协作" />
        <el-tab-pane label="知识库" name="知识库" />
      </el-tabs>
      <div class="filter-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
        />
      </div>
    </div>

    <!-- 时间线 -->
    <div class="timeline-container">
      <el-timeline>
        <el-timeline-item
          v-for="record in filteredHistory"
          :key="record.id"
          :timestamp="record.timestamp"
          :type="getTimelineType(record.status)"
          placement="top"
        >
          <el-card class="history-card" @click="handleViewDetail(record)">
            <div class="card-header">
              <div class="header-left">
                <el-icon :size="24" :color="getActionColor(record.action)">
                  <component :is="getActionIcon(record.action)" />
                </el-icon>
                <div class="header-info">
                  <h3>{{ record.action }}</h3>
                  <p class="document-title">{{ record.documentTitle }}</p>
                </div>
              </div>
              <div class="header-right">
                <el-tag :type="getStatusType(record.status)">
                  {{ record.status }}
                </el-tag>
              </div>
            </div>

            <div class="card-body">
              <div class="meta-info">
                <span class="meta-item">
                  <el-icon><Document /></el-icon>
                  {{ record.documentType }}
                </span>
                <span class="meta-item">
                  <el-icon><Timer /></el-icon>
                  耗时 {{ record.duration }}
                </span>
                <span v-if="record.details.wordCount" class="meta-item">
                  <el-icon><EditPen /></el-icon>
                  {{ record.details.wordCount }} 字
                </span>
              </div>

              <!-- 步骤进度 -->
              <div class="steps-progress">
                <el-steps :active="getActiveStep(record)" finish-status="success" simple>
                  <el-step
                    v-for="(step, index) in record.steps"
                    :key="index"
                    :title="step.step"
                    :status="getStepStatus(step.status)"
                  />
                </el-steps>
              </div>

              <!-- 详细信息 -->
              <div class="detail-info">
                <el-tag
                  v-if="record.details.scenario"
                  size="small"
                  type="info"
                >
                  场景：{{ record.details.scenario }}
                </el-tag>
                <el-tag
                  v-if="record.details.template"
                  size="small"
                  type="info"
                >
                  模板：{{ record.details.template }}
                </el-tag>
                <el-tag
                  v-if="record.details.complianceScore"
                  size="small"
                  :type="getScoreType(record.details.complianceScore)"
                >
                  合规度：{{ record.details.complianceScore }}分
                </el-tag>
              </div>
            </div>

            <div class="card-footer">
              <el-button
                v-if="record.details.exported"
                size="small"
                text
                type="success"
              >
                <el-icon><Check /></el-icon>
                已导出
              </el-button>
              <el-button
                v-if="record.details.archived"
                size="small"
                text
                type="success"
              >
                <el-icon><FolderChecked /></el-icon>
                已归档
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click.stop="handleContinue(record)"
              >
                <el-icon><Right /></el-icon>
                继续编辑
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 空状态 -->
      <el-empty v-if="filteredHistory.length === 0" description="暂无历史记录" />
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" :title="currentRecord?.documentTitle" width="700px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="操作类型">
          {{ currentRecord.action }}
        </el-descriptions-item>
        <el-descriptions-item label="文档类型">
          {{ currentRecord.documentType }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRecord.status)">
            {{ currentRecord.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">
          {{ currentRecord.duration }}
        </el-descriptions-item>
        <el-descriptions-item label="时间">
          {{ currentRecord.timestamp }}
        </el-descriptions-item>
        <el-descriptions-item label="字数" v-if="currentRecord.details.wordCount">
          {{ currentRecord.details.wordCount }} 字
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-steps" v-if="currentRecord">
        <h4>操作步骤</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(step, index) in currentRecord.steps"
            :key="index"
            :timestamp="step.time"
            :type="step.status === 'completed' ? 'success' : 'primary'"
          >
            {{ step.step }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleContinue(currentRecord)">
          继续编辑
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import historyData from '@/mock/history_data.json'

const router = useRouter()

// 数据
const history = ref([])
const activeTab = ref('all')
const dateRange = ref(null)
const showDetailDialog = ref(false)
const currentRecord = ref(null)

// 加载数据
onMounted(() => {
  history.value = historyData
})

// 过滤后的历史记录
const filteredHistory = computed(() => {
  let result = history.value

  // 按操作类型筛选
  if (activeTab.value !== 'all') {
    result = result.filter(record => {
      if (activeTab.value === '知识库') {
        return record.action === '知识库问答' || record.action === '上传知识库' || record.action === '查看归档'
      }
      return record.action === activeTab.value
    })
  }

  // 按日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= start && recordDate <= end
    })
  }

  return result
})

// 获取时间线类型
const getTimelineType = (status) => {
  const typeMap = {
    '已完成': 'success',
    '进行中': 'primary',
    '待审阅': 'warning',
    '已查看': 'info'
  }
  return typeMap[status] || ''
}

// 获取操作图标
const getActionIcon = (action) => {
  const iconMap = {
    '创建文档': 'DocumentAdd',
    '编辑文档': 'Edit',
    '复刻文档': 'CopyDocument',
    '审阅协作': 'EditPen',
    '查看归档': 'View',
    '知识库问答': 'ChatDotRound',
    '上传知识库': 'Upload'
  }
  return iconMap[action] || 'Document'
}

// 获取操作颜色
const getActionColor = (action) => {
  const colorMap = {
    '创建文档': '#1890FF',
    '编辑文档': '#52C41A',
    '复刻文档': '#FA8C16',
    '审阅协作': '#722ED1',
    '查看归档': '#13C2C2',
    '知识库问答': '#EB2F96',
    '上传知识库': '#2F54EB'
  }
  return colorMap[action] || '#909399'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '已完成': 'success',
    '进行中': 'primary',
    '待审阅': 'warning',
    '已查看': 'info'
  }
  return typeMap[status] || ''
}

// 获取活动步骤
const getActiveStep = (record) => {
  return record.steps.filter(s => s.status === 'completed').length
}

// 获取步骤状态
const getStepStatus = (status) => {
  const statusMap = {
    'completed': 'success',
    'in_progress': 'process',
    'pending': 'wait'
  }
  return statusMap[status] || 'wait'
}

// 获取分数类型
const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'danger'
}

// 标签页切换
const handleTabChange = () => {
  // 标签切换逻辑已在computed中处理
}

// 查看详情
const handleViewDetail = (record) => {
  currentRecord.value = record
  showDetailDialog.value = true
}

// 继续编辑
const handleContinue = (record) => {
  ElMessage.success(`继续编辑：${record.documentTitle}`)
  router.push('/writer')
}

// 清空历史
const handleClearHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有历史记录吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    history.value = []
    ElMessage.success('历史记录已清空')
  }).catch(() => {
    ElMessage.info('已取消')
  })
}
</script>

<style scoped>
.history-page {
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

/* 筛选区 */
.filter-section {
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 时间线容器 */
.timeline-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 历史卡片 */
.history-card {
  cursor: pointer;
  transition: all 0.3s;
}

.history-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.header-info h3 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #303133;
}

.document-title {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.card-body {
  margin-bottom: 16px;
}

.meta-info {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.steps-progress {
  margin-bottom: 16px;
}

.detail-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 详情步骤 */
.detail-steps {
  margin-top: 24px;
}

.detail-steps h4 {
  margin: 0 0 16px;
  font-size: 15px;
  color: #303133;
}
</style>
