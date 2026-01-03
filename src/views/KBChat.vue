<template>
  <div class="kb-chat-page">
    <!-- 顶部导航栏 -->
    <div class="chat-header">
      <div class="header-left">
        <el-icon :size="24" color="#1890FF"><ChatDotRound /></el-icon>
        <h1>知识库问答</h1>
        <el-tag size="small" type="info">{{ selectedKBs.length }} 个知识库</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>
          返回知识库
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="chat-main">
      <!-- 左侧对话区 -->
      <div class="chat-left">
        <!-- 对话消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <el-empty description="当前没有对话记录">
              <template #image>
                <el-icon :size="80" color="#C0C4CC"><ChatDotRound /></el-icon>
              </template>
              <p class="empty-tips">请从右侧选择知识库，然后在下方输入问题</p>
            </el-empty>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-item', msg.role]"
          >
            <div class="message-avatar">
              <el-avatar v-if="msg.role === 'user'" :size="36">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-avatar v-else :size="36" style="background: #1890FF">
                <el-icon><ChatDotRound /></el-icon>
              </el-avatar>
            </div>

            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">
                  {{ msg.role === 'user' ? '我' : 'AI 助手' }}
                </span>
                <span class="message-time">{{ msg.time }}</span>
              </div>
              <div class="message-text" v-html="msg.content"></div>

              <!-- 引用来源 -->
              <div v-if="msg.sources && msg.sources.length > 0" class="message-sources">
                <div class="sources-header">
                  <el-icon><Link /></el-icon>
                  <span>引用来源</span>
                </div>
                <div class="sources-list">
                  <div
                    v-for="(source, idx) in msg.sources"
                    :key="idx"
                    class="source-item"
                    @click="handleViewSource(source)"
                  >
                    <el-icon><Document /></el-icon>
                    <div class="source-info">
                      <div class="source-title">{{ source.title }}</div>
                      <div class="source-detail">{{ source.chapter }}</div>
                    </div>
                    <el-icon class="source-arrow"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="input-container">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="3"
            placeholder="请输入问题，例如：旷课怎么处理？"
            @keydown.enter.exact.prevent="handleSend"
          />
          <div class="input-actions">
            <div class="input-tips">
              <el-icon><InfoFilled /></el-icon>
              <span>按 Enter 发送，Shift + Enter 换行</span>
            </div>
            <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()">
              <el-icon><Position /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧设置面板 -->
      <div class="chat-right">
        <!-- 知识库选择 -->
        <div class="panel-section">
          <div class="section-header">
            <h3>知识库</h3>
            <el-button size="small" text @click="handleRefreshKB">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
          <div class="kb-selector">
            <el-checkbox-group v-model="selectedKBs">
              <div
                v-for="kb in knowledgeBases"
                :key="kb.id"
                class="kb-option"
              >
                <el-checkbox :label="kb.id">
                  <div class="kb-option-content">
                    <el-icon :size="20" :color="kb.color">
                      <component :is="kb.icon" />
                    </el-icon>
                    <div class="kb-option-text">
                      <div class="kb-option-name">{{ kb.name }}</div>
                      <div class="kb-option-count">{{ kb.documentCount }} 个文档</div>
                    </div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </div>

        <!-- 检索文件列表 -->
        <div class="panel-section">
          <div class="section-header">
            <h3>文件列表</h3>
            <el-input
              v-model="fileSearchKeyword"
              size="small"
              placeholder="搜索文件"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="file-list">
            <div v-if="referencedFiles.length === 0" class="empty-files">
              <el-icon :size="40" color="#C0C4CC"><FolderOpened /></el-icon>
              <p>暂无检索文件</p>
            </div>
            <div
              v-for="file in filteredFiles"
              :key="file.id"
              class="file-item"
              @click="handleViewFile(file)"
            >
              <el-icon color="#1890FF"><Document /></el-icon>
              <div class="file-info">
                <div class="file-name">{{ file.title }}</div>
                <div class="file-meta">
                  <el-tag size="small" type="info">{{ file.kb }}</el-tag>
                  <span class="file-date">{{ file.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 参数设置 -->
        <div class="panel-section">
          <div class="section-header">
            <h3>参数设置</h3>
          </div>
          <div class="settings-form">
            <div class="setting-item">
              <div class="setting-label">
                <span>检索深度</span>
                <el-tooltip content="控制检索文档的数量，值越大检索越全面">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <el-slider v-model="settings.searchDepth" :min="1" :max="10" show-stops />
              <div class="setting-value">{{ settings.searchDepth }}</div>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>相似度阈值</span>
                <el-tooltip content="控制匹配的精确度，值越高越精确">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <el-slider v-model="settings.similarity" :min="0" :max="100" />
              <div class="setting-value">{{ settings.similarity }}%</div>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>回答详细度</span>
              </div>
              <el-radio-group v-model="settings.answerDetail">
                <el-radio label="简洁">简洁</el-radio>
                <el-radio label="适中">适中</el-radio>
                <el-radio label="详细">详细</el-radio>
              </el-radio-group>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>引用来源</span>
              </div>
              <el-switch v-model="settings.showSource" active-text="显示" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import knowledgeBaseData from '@/mock/knowledge_base.json'

const router = useRouter()

// 数据
const knowledgeBases = ref([])
const selectedKBs = ref(['kb_rules']) // 默认选中制度法规库
const messages = ref([])
const inputText = ref('')
const messagesContainer = ref(null)
const fileSearchKeyword = ref('')
const referencedFiles = ref([])

// 参数设置
const settings = ref({
  searchDepth: 5,
  similarity: 70,
  answerDetail: '适中',
  showSource: true
})

// 加载数据
onMounted(() => {
  knowledgeBases.value = knowledgeBaseData
  
  // 添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '您好！我是知识库智能助手。请从右侧选择知识库，然后向我提问。',
    time: getCurrentTime()
  })
})

// 过滤后的文件列表
const filteredFiles = computed(() => {
  if (!fileSearchKeyword.value) return referencedFiles.value
  
  const keyword = fileSearchKeyword.value.toLowerCase()
  return referencedFiles.value.filter(file =>
    file.title.toLowerCase().includes(keyword)
  )
})

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 发送消息
const handleSend = () => {
  if (!inputText.value.trim()) return
  
  if (selectedKBs.value.length === 0) {
    ElMessage.warning('请先选择至少一个知识库')
    return
  }

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: inputText.value,
    time: getCurrentTime()
  })

  const userQuestion = inputText.value
  inputText.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // 模拟AI回复
  setTimeout(() => {
    const response = generateMockResponse(userQuestion)
    messages.value.push(response)
    
    // 添加引用文件到列表
    if (response.sources) {
      response.sources.forEach(source => {
        if (!referencedFiles.value.find(f => f.id === source.id)) {
          referencedFiles.value.push({
            id: source.id,
            title: source.title,
            kb: source.kb || '制度法规库',
            date: '2024-09-01'
          })
        }
      })
    }

    nextTick(() => {
      scrollToBottom()
    })
  }, 1000)
}

// 生成模拟回复
const generateMockResponse = (question) => {
  return {
    role: 'assistant',
    content: `根据<strong>《广西警察学院公文处理办法》</strong>第三章 发文办理规定，<strong>拟写通知</strong>的一般流程如下：<br><br>
      1. <strong>草拟</strong>：由主办部门根据工作需要起草通知文稿，做到观点明确、内容充实、结构严谨、表述准确。<br>
      2. <strong>审核</strong>：部门负责人对文稿进行初审，主要审核内容是否符合政策法规、格式是否规范。<br>
      3. <strong>签发</strong>：经审核无误后，呈报分管校领导或主要领导审阅签发。重要通知需经学校主要领导签发。<br>
      4. <strong>编号印发</strong>：由校办统一编写文号，进行排版、校对、印制和分发。<br>
      5. <strong>归档</strong>：发文后，将正本、底稿及相关材料整理归档。<br><br>
      注意事项：涉及多个部门职权范围的事项，应当进行会商，取得一致意见后再行发文。`,
    time: getCurrentTime(),
    sources: settings.value.showSource ? [
      {
        id: 'doc_gongwen',
        title: '广西警察学院公文处理办法',
        chapter: '第三章 发文办理',
        kb: '制度法规库'
      },
      {
        id: 'doc_liucheng',
        title: '行政公文办理流程图',
        chapter: '附件一',
        kb: '办事指南库'
      }
    ] : null
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 查看来源
const handleViewSource = (source) => {
  ElMessage.info(`查看原文：${source.title}`)
}

// 查看文件
const handleViewFile = (file) => {
  ElMessage.info(`查看文件：${file.title}`)
}

// 刷新知识库
const handleRefreshKB = () => {
  ElMessage.success('知识库已刷新')
}

// 返回
const handleBack = () => {
  router.push('/knowledge')
}
</script>

<style scoped>
.kb-chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 顶部导航 */
.chat-header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

/* 主内容区 */
.chat-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 360px;
  overflow: hidden;
}

/* 左侧对话区 */
.chat-left {
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e8e8e8;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-tips {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-item.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.message-sender {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-text {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.6;
  color: #303133;
}

.message-item.user .message-text {
  background: #1890FF;
  color: white;
}

/* 引用来源 */
.message-sources {
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.sources-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.source-item:hover {
  background: #f0f9ff;
  border-color: #1890FF;
}

.source-info {
  flex: 1;
}

.source-title {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
}

.source-detail {
  font-size: 12px;
  color: #909399;
}

.source-arrow {
  color: #C0C4CC;
}

/* 输入区 */
.input-container {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background: white;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.input-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

/* 右侧面板 */
.chat-right {
  background: #fafafa;
  overflow-y: auto;
  padding: 16px;
}

.panel-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 15px;
  color: #303133;
}

/* 知识库选择 */
.kb-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kb-option {
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.kb-option:hover {
  background: #f5f7fa;
}

.kb-option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kb-option-text {
  flex: 1;
}

.kb-option-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.kb-option-count {
  font-size: 12px;
  color: #909399;
}

/* 文件列表 */
.file-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-files {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-files p {
  margin-top: 12px;
  font-size: 13px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.file-item:hover {
  background: #f0f9ff;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  color: #303133;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-date {
  font-size: 12px;
  color: #909399;
}

/* 参数设置 */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.setting-value {
  text-align: right;
  font-size: 12px;
  color: #1890FF;
  font-weight: 500;
}
</style>
