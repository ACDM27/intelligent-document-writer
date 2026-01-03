<template>
  <div class="dashboard-page">
    <div class="page-container">
      <!-- 核心入口区 -->
      <el-row :gutter="24" class="core-cards">
        <!-- 行政公文起草 -->
        <el-col :span="12">
          <div class="core-card admin-card">
            <div class="card-icon">
              <el-icon :size="56"><Document /></el-icon>
            </div>
            <h2 class="card-title">行政公文起草</h2>
            <p class="card-subtitle">AI辅助起草标准化公文材料</p>
            <div class="card-actions">
              <el-button type="primary" size="large" round @click.stop="goToWriter">
                <el-icon><Edit /></el-icon>
                立即起草
              </el-button>
              <el-button size="large" round plain @click.stop="goToTemplates">
                <el-icon><FolderOpened /></el-icon>
                选择模板
              </el-button>
              <el-button size="large" round plain @click.stop="goToHistory">
                <el-icon><Clock /></el-icon>
                历史草稿
              </el-button>
            </div>
          </div>
        </el-col>

        <!-- 科研/教学材料 -->
        <el-col :span="12">
          <div class="core-card research-card">
            <div class="card-icon">
              <el-icon :size="56"><Reading /></el-icon>
            </div>
            <h2 class="card-title">科研/教学材料</h2>
            <p class="card-subtitle">AI 辅助撰写专业文档方案</p>
            <div class="card-actions">
              <el-button type="success" size="large" round @click.stop="goToWriter">
                <el-icon><Edit /></el-icon>
                立即起草
              </el-button>
              <el-button size="large" round plain @click.stop="goToTemplates">
                <el-icon><FolderOpened /></el-icon>
                选择模板
              </el-button>
              <el-button size="large" round plain @click.stop="goToHistory">
                <el-icon><Clock /></el-icon>
                历史草稿
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 特色专区 -->
      <div class="feature-section">
        <h3 class="section-title">特色专区</h3>
        <el-row :gutter="20" class="feature-cards">
          <el-col :span="6">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon :size="40" color="#1890FF"><CircleCheck /></el-icon>
              </div>
              <h4 class="feature-title">合规性自查</h4>
              <p class="feature-desc">自动检测格式合规性问题</p>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon :size="40" color="#52C41A"><FolderOpened /></el-icon>
              </div>
              <h4 class="feature-title">历史文书库</h4>
              <p class="feature-desc">检索往年优质文档模板</p>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon :size="40" color="#FA8C16"><Download /></el-icon>
              </div>
              <h4 class="feature-title">模板下载</h4>
              <p class="feature-desc">下载官方 Word/PDF 模板</p>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon :size="40" color="#722ED1"><Tools /></el-icon>
              </div>
              <h4 class="feature-title">AI 工具箱</h4>
              <p class="feature-desc">润色、翻译、智能辅助工具</p>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 最近任务 -->
      <div class="task-section">
        <div class="section-header">
          <h3 class="section-title">最近任务</h3>
          <el-link type="primary" :underline="false">
            查看全部 →
          </el-link>
        </div>

        <el-table :data="taskList" class="task-table" stripe>
          <el-table-column prop="id" label="序号" width="80" align="center" />
          <el-table-column prop="title" label="文书名称" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" :underline="false">{{ row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="任务类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeColor(row.type)" size="large">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)" size="large">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建时间" width="200" align="center" />
          <el-table-column label="操作" width="180" align="center">
            <template #default>
              <el-button type="primary" link size="large">编辑</el-button>
              <el-button type="danger" link size="large">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import taskListData from '@/mock/task_list.json'

const router = useRouter()
const taskList = ref(taskListData)

// 移除通用的卡片点击跳转，改由按钮控制
const goToWriter = () => {
  router.push('/writer')
}

const goToTemplates = () => {
  router.push('/templates')
}

const goToHistory = () => {
  router.push('/history')
}

const getTypeColor = (type) => {
  const colorMap = {
    '行政通知': '',
    '会议纪要': 'success',
    '请示报告': 'warning',
    '项目申报': 'info'
  }
  return colorMap[type] || ''
}

const getStatusColor = (status) => {
  const colorMap = {
    '草稿': '',
    '审核中': 'warning',
    '已归档': 'success',
    '未完成': 'info'
  }
  return colorMap[status] || ''
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 0;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 核心卡片区域 */
.core-cards {
  margin-bottom: 40px;
}

.core-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 48px 40px;
  color: white;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.core-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.admin-card {
  background: linear-gradient(135deg, #1890FF 0%, #096dd9 100%);
}

.research-card {
  background: linear-gradient(135deg, #13c2c2 0%, #08979c 100%);
}

.card-icon {
  margin-bottom: 24px;
}

.card-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: bold;
  text-align: center;
}

.card-subtitle {
  margin: 0 0 32px;
  font-size: 16px;
  opacity: 0.9;
  text-align: center;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.card-actions .el-button {
  font-size: 15px;
  padding: 12px 24px;
}

/* 特色专区 */
.feature-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 24px;
  padding-left: 12px;
  border-left: 4px solid #1890FF;
}

.feature-cards {
  margin-top: 20px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  margin-bottom: 16px;
}

.feature-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.feature-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.feature-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 任务区域 */
.task-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-table {
  font-size: 14px;
}

.task-table :deep(.el-table__header th) {
  background: #fafafa;
  font-weight: 600;
  color: #303133;
}

.task-table :deep(.el-tag) {
  font-size: 13px;
}
</style>
