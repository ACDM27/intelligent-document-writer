<template>
  <div class="review-detail-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>
          返回列表
        </el-button>
        <el-divider direction="vertical" />
        <h2>{{ document.title }}</h2>
        <el-tag :type="getStatusType(document.status)">{{ document.status }}</el-tag>
      </div>
      <div class="toolbar-right">
        <el-button @click="showVersionDialog = true">
          <el-icon><Clock /></el-icon>
          版本历史
        </el-button>
        <el-button @click="showShareDialog = true">
          <el-icon><Share /></el-icon>
          分享协作
        </el-button>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出文档
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧文档编辑区 -->
      <div class="editor-section">
        <div class="editor-header">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="edit">编辑模式</el-radio-button>
            <el-radio-button label="preview">预览模式</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 编辑器 -->
        <div v-if="viewMode === 'edit'" class="editor-container">
          <el-input
            v-model="documentContent"
            type="textarea"
            :rows="30"
            placeholder="文档内容..."
          />
        </div>

        <!-- 预览 -->
        <div v-else class="preview-container">
          <RedHeaderDoc
            v-if="document"
            :header-type="'admin'"
            :content="{
              title: document.title,
              doc_number: '桂警院教字〔2026〕15号',
              sender: '广西警察学院',
              date: '2026年3月1日',
              paragraphs: documentContent.split('\n\n')
            }"
            :show-seal="true"
          />
        </div>
      </div>

      <!-- 右侧检视面板 -->
      <div class="checker-panel">
        <el-tabs v-model="activePanel">
          <!-- AI合规检视 -->
          <el-tab-pane label="合规检视" name="compliance">
            <div class="compliance-panel">
              <!-- 总分卡片 -->
              <div class="score-card">
                <div class="score-circle-large" :class="getScoreClass(document.complianceScore)">
                  <span class="score-value">{{ document.complianceScore }}</span>
                  <span class="score-label">分</span>
                </div>
                <div class="score-info">
                  <h3>合规度评分</h3>
                  <p>{{ getScoreDesc(document.complianceScore) }}</p>
                  <el-button size="small" type="primary" @click="handleRecheck">
                    <el-icon><Refresh /></el-icon>
                    重新检测
                  </el-button>
                </div>
              </div>

              <!-- 问题列表 -->
              <div class="issues-list">
                <div class="issues-header">
                  <h4>检测到 {{ document.issues.length }} 个问题</h4>
                </div>
                <div
                  v-for="issue in document.issues"
                  :key="issue.id"
                  class="issue-item"
                  :class="`issue-${issue.severity}`"
                  @click="handleLocateIssue(issue)"
                >
                  <div class="issue-icon">
                    <el-icon v-if="issue.severity === 'error'"><CircleCloseFilled /></el-icon>
                    <el-icon v-else-if="issue.severity === 'warning'"><WarningFilled /></el-icon>
                    <el-icon v-else><InfoFilled /></el-icon>
                  </div>
                  <div class="issue-content">
                    <div class="issue-header">
                      <span class="issue-type">{{ issue.type }}</span>
                      <el-tag :type="getSeverityType(issue.severity)" size="small">
                        {{ getSeverityLabel(issue.severity) }}
                      </el-tag>
                    </div>
                    <div class="issue-title">{{ issue.title }}</div>
                    <div class="issue-desc">{{ issue.description }}</div>
                    <div v-if="issue.suggestion" class="issue-suggestion">
                      <el-icon><Promotion /></el-icon>
                      <span>建议：{{ issue.suggestion }}</span>
                    </div>
                    <div class="issue-actions">
                      <el-button
                        v-if="issue.autoFix"
                        size="small"
                        type="primary"
                        @click.stop="handleAutoFix(issue)"
                      >
                        一键修复
                      </el-button>
                      <el-button size="small" @click.stop="handleIgnoreIssue(issue)">
                        忽略
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 协作者 -->
          <el-tab-pane label="协作者" name="collaborators">
            <div class="collaborators-panel">
              <div class="collab-list">
                <div
                  v-for="collab in document.collaborators"
                  :key="collab.name"
                  class="collab-item"
                >
                  <el-avatar>{{ collab.name.substring(0, 1) }}</el-avatar>
                  <div class="collab-info">
                    <div class="collab-name">{{ collab.name }}</div>
                    <div class="collab-role">{{ collab.role }}</div>
                  </div>
                  <div class="collab-status">
                    <el-tag :type="collab.status === '已审阅' ? 'success' : 'info'" size="small">
                      {{ collab.status }}
                    </el-tag>
                    <div v-if="collab.time" class="collab-time">{{ collab.time }}</div>
                  </div>
                </div>
              </div>

              <el-button type="primary" style="width: 100%; margin-top: 16px" @click="showShareDialog = true">
                <el-icon><Plus /></el-icon>
                添加协作者
              </el-button>
            </div>
          </el-tab-pane>

          <!-- 批注 -->
          <el-tab-pane label="批注" name="comments">
            <div class="comments-panel">
              <el-empty description="暂无批注" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 分享协作对话框 -->
    <el-dialog v-model="showShareDialog" title="分享协作" width="600px">
      <el-form label-width="100px">
        <el-form-item label="协作模式">
          <el-radio-group v-model="shareMode">
            <el-radio label="comment">
              <div class="mode-option">
                <strong>访客批注</strong>
                <p>只能添加批注，不能修改原文</p>
              </div>
            </el-radio>
            <el-radio label="suggest">
              <div class="mode-option">
                <strong>修订模式</strong>
                <p>可以修改原文，但需要创作者确认</p>
              </div>
            </el-radio>
            <el-radio label="edit">
              <div class="mode-option">
                <strong>完全编辑</strong>
                <p>多人实时在线编辑，内容实时同步</p>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="有效期">
          <el-select v-model="shareExpiry">
            <el-option label="1天" value="1d" />
            <el-option label="3天" value="3d" />
            <el-option label="7天" value="7d" />
            <el-option label="永久" value="forever" />
          </el-select>
        </el-form-item>

        <el-form-item label="分享链接">
          <el-input v-model="shareLink" readonly>
            <template #append>
              <el-button @click="handleCopyLink">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showShareDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleGenerateLink">生成链接</el-button>
      </template>
    </el-dialog>

    <!-- 版本历史对话框 -->
    <el-dialog v-model="showVersionDialog" title="版本历史" width="700px">
      <el-timeline>
        <el-timeline-item
          v-for="version in document.versions"
          :key="version.id"
          :timestamp="version.time"
        >
          <div class="version-item">
            <h4>{{ version.name }}</h4>
            <p>{{ version.description }}</p>
            <div class="version-meta">
              <span>创建者：{{ version.creator }}</span>
              <el-button size="small" type="primary" link>恢复此版本</el-button>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import RedHeaderDoc from '@/components/RedHeaderDoc.vue'
import reviewData from '@/mock/review_data.json'

const router = useRouter()
const route = useRoute()

// 数据
const document = ref({})
const documentContent = ref('')
const viewMode = ref('edit')
const activePanel = ref('compliance')
const showShareDialog = ref(false)
const showVersionDialog = ref(false)
const shareMode = ref('comment')
const shareExpiry = ref('7d')
const shareLink = ref('')

// 加载数据
onMounted(() => {
  const docId = route.params.id
  document.value = reviewData.find(d => d.id === docId) || reviewData[0]
  
  // 模拟文档内容
  documentContent.value = `各学院、各部门：

为全面总结2025年秋季学期教学工作，部署2026年春季学期重点任务，经研究，定于2026年3月5日召开2026年春季学期教学工作会议。现将有关事项通知如下：

一、会议时间
2026年3月5日（星期三）下午14:30

二、会议地点
行政楼三楼会议室

三、参会人员
1. 各学院院长、分管教学副院长
2. 教务处全体人员
3. 教学督导组成员

四、会议议程
1. 教务处处长作2025年秋季学期教学工作总结
2. 部署2026年春季学期重点工作
3. 讨论《广西警察学院本科教学质量提升方案》
4. 校领导讲话

五、相关要求
1. 请各单位高度重视，按时参会，不得缺席
2. 请参会人员提前准备相关材料
3. 会议期间请将手机调至静音

特此通知。

广西警察学院教务处
2026年2月28日`
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

// 获取严重程度类型
const getSeverityType = (severity) => {
  const typeMap = {
    'error': 'danger',
    'warning': 'warning',
    'info': 'info'
  }
  return typeMap[severity] || ''
}

// 获取严重程度标签
const getSeverityLabel = (severity) => {
  const labelMap = {
    'error': '严重',
    'warning': '警告',
    'info': '提示'
  }
  return labelMap[severity] || ''
}

// 返回列表
const handleBack = () => {
  router.push('/review')
}

// 重新检测
const handleRecheck = () => {
  ElMessage.success('正在重新检测...')
}

// 定位问题
const handleLocateIssue = (issue) => {
  ElMessage.info(`定位到问题：${issue.title}`)
}

// 一键修复
const handleAutoFix = (issue) => {
  ElMessage.success(`已修复：${issue.title}`)
}

// 忽略问题
const handleIgnoreIssue = (issue) => {
  ElMessage.info(`已忽略：${issue.title}`)
}

// 导出文档
const handleExport = () => {
  ElMessage.success('文档导出成功')
}

// 生成分享链接
const handleGenerateLink = () => {
  shareLink.value = `https://doc.gxjcxy.edu.cn/share/${Math.random().toString(36).substr(2, 9)}`
  ElMessage.success('链接已生成')
}

// 复制链接
const handleCopyLink = () => {
  navigator.clipboard.writeText(shareLink.value)
  ElMessage.success('链接已复制到剪贴板')
}
</script>

<style scoped>
.review-detail-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 工具栏 */
.toolbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-left h2 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  overflow: hidden;
}

/* 编辑区 */
.editor-section {
  background: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
}

.editor-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.editor-container,
.preview-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 检视面板 */
.checker-panel {
  background: #fafafa;
  overflow-y: auto;
}

.compliance-panel,
.collaborators-panel,
.comments-panel {
  padding: 16px;
}

/* 分数卡片 */
.score-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.score-circle-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 5px solid;
  flex-shrink: 0;
}

.score-circle-large.score-excellent {
  border-color: #67C23A;
  background: #f0f9ff;
}

.score-circle-large.score-good {
  border-color: #409EFF;
  background: #ecf5ff;
}

.score-circle-large.score-normal {
  border-color: #E6A23C;
  background: #fdf6ec;
}

.score-circle-large.score-poor {
  border-color: #F56C6C;
  background: #fef0f0;
}

.score-value {
  font-size: 36px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 14px;
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

.score-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.score-info p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
}

/* 问题列表 */
.issues-list {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.issues-header h4 {
  margin: 0 0 16px;
  font-size: 15px;
  color: #303133;
}

.issue-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.issue-item:hover {
  background: #f5f7fa;
}

.issue-item.issue-error {
  border-left: 4px solid #F56C6C;
  background: #fef0f0;
}

.issue-item.issue-warning {
  border-left: 4px solid #E6A23C;
  background: #fdf6ec;
}

.issue-item.issue-info {
  border-left: 4px solid #409EFF;
  background: #ecf5ff;
}

.issue-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.issue-error .issue-icon {
  color: #F56C6C;
}

.issue-warning .issue-icon {
  color: #E6A23C;
}

.issue-info .issue-icon {
  color: #409EFF;
}

.issue-content {
  flex: 1;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.issue-type {
  font-size: 12px;
  color: #909399;
}

.issue-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.issue-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.issue-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: #1890FF;
  margin-bottom: 12px;
}

.issue-actions {
  display: flex;
  gap: 8px;
}

/* 协作者列表 */
.collab-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.collab-info {
  flex: 1;
}

.collab-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.collab-role {
  font-size: 12px;
  color: #909399;
}

.collab-status {
  text-align: right;
}

.collab-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 分享模式选项 */
.mode-option {
  margin-left: 8px;
}

.mode-option strong {
  display: block;
  margin-bottom: 4px;
}

.mode-option p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

/* 版本历史 */
.version-item h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #303133;
}

.version-item p {
  margin: 0 0 8px;
  font-size: 13px;
  color: #606266;
}

.version-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}
</style>
