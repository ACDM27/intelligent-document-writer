<template>
  <div class="knowledge-base-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>知识库</h1>
        <p>智能文档检索与知识管理中心</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Upload /></el-icon>
          上传文档
        </el-button>
        <el-button @click="handleGoToChat">
          <el-icon><ChatDotRound /></el-icon>
          知识库对话
        </el-button>
      </div>
    </div>

    <!-- 知识库卡片网格 -->
    <div class="kb-grid">
      <div
        v-for="kb in knowledgeBases"
        :key="kb.id"
        class="kb-card"
        @click="handleKBClick(kb)"
      >
        <div class="kb-icon" :style="getKBIconStyle(kb)">
          <el-icon :size="48">
            <component :is="kb.icon" />
          </el-icon>
        </div>
        <div class="kb-content">
          <h3>{{ kb.name }}</h3>
          <p class="kb-desc">{{ kb.description }}</p>
          <div class="kb-stats">
            <span class="stat-item">
              <el-icon><Document /></el-icon>
              {{ kb.documentCount }} 个文档
            </span>
            <span class="stat-item">
              <el-icon><Clock /></el-icon>
              最后更新 {{ kb.lastUpdate }}
            </span>
          </div>
          <div class="kb-tags">
            <el-tag
              v-for="tag in kb.tags.slice(0, 3)"
              :key="tag"
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传文档对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文档到知识库"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-steps :active="uploadStep" align-center class="upload-steps">
        <el-step title="上传文件" />
        <el-step title="属性标引" />
        <el-step title="智能解析" />
        <el-step title="脱敏确认" />
      </el-steps>

      <!-- Step 1: 上传文件 -->
      <div v-if="uploadStep === 0" class="step-content">
        <el-form label-width="100px">
          <el-form-item label="选择知识库">
            <el-select v-model="uploadForm.kbId" placeholder="请选择">
              <el-option
                v-for="kb in knowledgeBases"
                :key="kb.id"
                :label="kb.name"
                :value="kb.id"
              >
                <span style="float: left">{{ kb.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">
                  {{ kb.documentCount }} 个文档
                </span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="上传文件">
            <el-upload
              drag
              :auto-upload="false"
              :on-change="handleFileChange"
              accept=".pdf,.doc,.docx,.jpg,.png"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、Word、红头图片（OCR识别）
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: 属性标引 -->
      <div v-if="uploadStep === 1" class="step-content">
        <el-form :model="uploadForm" label-width="100px">
          <el-form-item label="文档标题">
            <el-input v-model="uploadForm.title" placeholder="请输入文档标题" />
          </el-form-item>

          <el-form-item label="适用部门">
            <el-select v-model="uploadForm.department" placeholder="请选择">
              <el-option label="教务处" value="教务处" />
              <el-option label="科研处" value="科研处" />
              <el-option label="学生工作部" value="学生工作部" />
              <el-option label="党委宣传部" value="党委宣传部" />
              <el-option label="发展规划处" value="发展规划处" />
            </el-select>
          </el-form-item>

          <el-form-item label="文书年份">
            <el-date-picker
              v-model="uploadForm.year"
              type="year"
              placeholder="选择年份"
            />
          </el-form-item>

          <el-form-item label="效力级别" v-if="uploadForm.kbId === 'kb_rules'">
            <el-radio-group v-model="uploadForm.authorityLevel">
              <el-radio label="国家级">国家级</el-radio>
              <el-radio label="省部级">省部级</el-radio>
              <el-radio label="校级">校级</el-radio>
              <el-radio label="院级">院级</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="有效期" v-if="uploadForm.kbId === 'kb_rules'">
            <el-radio-group v-model="uploadForm.validityPeriod">
              <el-radio label="现行有效">现行有效</el-radio>
              <el-radio label="已废止">已废止</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="业务标签">
            <el-select
              v-model="uploadForm.tags"
              multiple
              placeholder="请选择标签"
              style="width: 100%"
            >
              <el-option label="双一流" value="双一流" />
              <el-option label="审核评估" value="审核评估" />
              <el-option label="立德树人" value="立德树人" />
              <el-option label="教学质量" value="教学质量" />
              <el-option label="科研管理" value="科研管理" />
              <el-option label="学生管理" value="学生管理" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3: 智能解析 -->
      <div v-if="uploadStep === 2" class="step-content parsing-view">
        <div class="parsing-left">
          <h4>原文预览</h4>
          <div class="document-preview">
            <p>{{ uploadForm.title }}</p>
            <p class="preview-text">
              第一章 总则<br>
              第一条 为规范本科学生学籍管理...<br>
              第二条 本规定适用于...<br>
              ...<br>
              第四章 纪律与处分<br>
              第十二条 旷课累计达到10学时，给予警告处分...
            </p>
          </div>
        </div>
        <div class="parsing-right">
          <h4>智能拆解条款</h4>
          <div class="clauses-list">
            <div v-for="(clause, index) in parsedClauses" :key="index" class="clause-item">
              <el-checkbox v-model="clause.confirmed" />
              <div class="clause-content">
                <strong>{{ clause.title }}</strong>
                <p>{{ clause.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: 脱敏确认 -->
      <div v-if="uploadStep === 3" class="step-content">
        <el-alert
          title="检测到敏感信息"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        >
          系统自动检测到以下敏感信息，建议进行脱敏处理
        </el-alert>

        <el-table :data="sensitiveData" border>
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="original" label="原始内容" width="200" />
          <el-table-column prop="masked" label="脱敏后" width="200" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-switch v-model="row.shouldMask" active-text="脱敏" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button v-if="uploadStep > 0" @click="uploadStep--">上一步</el-button>
        <el-button v-if="uploadStep < 3" type="primary" @click="uploadStep++">
          下一步
        </el-button>
        <el-button v-if="uploadStep === 3" type="primary" @click="handleUploadComplete">
          完成上传
        </el-button>
      </template>
    </el-dialog>

    <!-- 知识库详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="currentKB?.name"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="currentKB" class="kb-detail">
        <el-descriptions :column="3" border style="margin-bottom: 20px">
          <el-descriptions-item label="文档数量">
            {{ currentKB.documentCount }} 个
          </el-descriptions-item>
          <el-descriptions-item label="最后更新">
            {{ currentKB.lastUpdate }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            <el-tag
              v-for="tag in currentKB.tags"
              :key="tag"
              size="small"
              style="margin-right: 8px"
            >
              {{ tag }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 文档列表 -->
        <div v-if="currentKB.documents && currentKB.documents.length > 0">
          <h4 style="margin: 20px 0 16px">文档列表</h4>
          <el-table :data="currentKB.documents" border stripe>
            <el-table-column prop="title" label="文档标题" min-width="200" />
            <el-table-column prop="department" label="部门" width="120" />
            <el-table-column prop="year" label="年份" width="100" />
            <el-table-column
              v-if="currentKB.id === 'kb_rules'"
              prop="authorityLevel"
              label="效力级别"
              width="100"
            />
            <el-table-column
              v-if="currentKB.id === 'kb_rules'"
              prop="validityPeriod"
              label="有效期"
              width="100"
            >
              <template #default="{ row }">
                <el-tag :type="row.validityPeriod === '现行有效' ? 'success' : 'info'">
                  {{ row.validityPeriod }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small">查看</el-button>
                <el-button type="primary" link size="small">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 术语列表 -->
        <div v-if="currentKB.terms && currentKB.terms.length > 0">
          <h4 style="margin: 20px 0 16px">术语规范</h4>
          <el-table :data="currentKB.terms" border stripe>
            <el-table-column prop="incorrect" label="错误用法" width="200" />
            <el-table-column prop="correct" label="规范用法" width="200" />
            <el-table-column prop="category" label="类别" width="120" />
            <el-table-column prop="usage" label="使用说明" min-width="200" />
          </el-table>
        </div>

        <!-- 个人素材列表 -->
        <div v-if="currentKB.materials && currentKB.materials.length > 0">
          <h4 style="margin: 20px 0 16px">我的素材</h4>
          <el-table :data="currentKB.materials" border stripe>
            <el-table-column prop="title" label="素材标题" width="200" />
            <el-table-column prop="category" label="类别" width="120" />
            <el-table-column prop="content" label="内容预览" min-width="300">
              <template #default="{ row }">
                {{ row.content.substring(0, 50) }}...
              </template>
            </el-table-column>
            <el-table-column prop="usageCount" label="使用次数" width="100" />
            <el-table-column label="操作" width="150" align="center">
              <template #default>
                <el-button type="primary" link size="small">编辑</el-button>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleUploadToKB">
          <el-icon><Upload /></el-icon>
          上传文档到此库
        </el-button>
      </template>
    </el-dialog>

    <!-- 知识库对话对话框 -->
    <el-dialog
      v-model="showChatDialog"
      title="知识库智能问答"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="chat-container">
        <div class="chat-messages">
          <div
            v-for="(msg, index) in chatMessages"
            :key="index"
            :class="['message', msg.role]"
          >
            <div class="message-content">
              <div class="message-text" v-html="msg.content"></div>
              <div v-if="msg.source" class="message-source">
                <el-tag size="small" type="info">
                  <el-icon><Link /></el-icon>
                  来源：{{ msg.source.title }}
                </el-tag>
                <el-button size="small" text @click="handleViewSource(msg.source)">
                  查看原文
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="chatInput"
            placeholder="请输入问题，例如：旷课怎么处理？"
            @keyup.enter="handleSendMessage"
          >
            <template #append>
              <el-button type="primary" @click="handleSendMessage">
                <el-icon><Position /></el-icon>
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import knowledgeBaseData from '@/mock/knowledge_base.json'

const router = useRouter()

// 数据
const knowledgeBases = ref([])
const showUploadDialog = ref(false)
const showChatDialog = ref(false)
const showDetailDialog = ref(false)
const currentKB = ref(null)
const uploadStep = ref(0)
const chatInput = ref('')
const chatMessages = ref([
  {
    role: 'assistant',
    content: '您好！我是知识库智能助手，您可以向我提问关于学校规章制度、历史文书等问题。'
  }
])

// 上传表单
const uploadForm = ref({
  kbId: '',
  title: '',
  department: '',
  year: null,
  authorityLevel: '校级',
  validityPeriod: '现行有效',
  tags: []
})

// 解析的条款
const parsedClauses = ref([
  {
    title: '第一条 总则',
    content: '为规范本科学生学籍管理，根据教育部相关规定，制定本办法。',
    confirmed: true
  },
  {
    title: '第十二条 旷课处分',
    content: '旷课累计达到10学时，给予警告处分；达到20学时，给予严重警告处分。',
    confirmed: true
  }
])

// 敏感数据
const sensitiveData = ref([
  {
    type: '身份证号',
    original: '450123199001011234',
    masked: '450123********1234',
    shouldMask: true
  },
  {
    type: '手机号',
    original: '13800138000',
    masked: '138****8000',
    shouldMask: true
  },
  {
    type: '经费金额',
    original: '¥1,234,567',
    masked: '¥***,***',
    shouldMask: true
  }
])

// 加载数据
onMounted(() => {
  knowledgeBases.value = knowledgeBaseData
})

// 点击知识库卡片 - 显示详情
const handleKBClick = (kb) => {
  currentKB.value = kb
  showDetailDialog.value = true
}

// 上传到指定知识库
const handleUploadToKB = () => {
  uploadForm.value.kbId = currentKB.value.id
  showDetailDialog.value = false
  showUploadDialog.value = true
}

// 跳转到知识库问答
const handleGoToChat = () => {
  router.push('/kb-chat')
}

// 获取知识库图标样式
const getKBIconStyle = (kb) => {
  const gradients = {
    'kb_rules': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'kb_samples': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'kb_terminology': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'kb_personal': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
  
  return {
    background: gradients[kb.id] || kb.color
  }
}

// 文件变化
const handleFileChange = (file) => {
  uploadForm.value.title = file.name.replace(/\.[^/.]+$/, '')
}

// 完成上传
const handleUploadComplete = () => {
  ElMessage.success('文档上传成功！')
  showUploadDialog.value = false
  uploadStep.value = 0
}

// 发送消息
const handleSendMessage = () => {
  if (!chatInput.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: chatInput.value
  })

  // 模拟AI回复
  setTimeout(() => {
    chatMessages.value.push({
      role: 'assistant',
      content: `根据<strong>《广西警察学院本科学生学籍管理规定（2024修订版）》</strong>第四章第十二条：<br><br>
        旷课累计达到10学时，给予警告处分；<br>
        旷课累计达到20学时，给予严重警告处分；<br>
        旷课累计达到30学时，给予记过处分。`,
      source: {
        title: '广西警察学院本科学生学籍管理规定（2024修订版）',
        chapter: '第四章第十二条'
      }
    })
  }, 1000)

  chatInput.value = ''
}

// 查看来源
const handleViewSource = (source) => {
  ElMessage.info(`查看原文：${source.title}`)
}
</script>

<style scoped>
.knowledge-base-page {
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

.header-content h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #303133;
}

.header-content p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 知识库网格 */
.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.kb-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 20px;
}

.kb-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.kb-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.kb-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.kb-card:hover .kb-icon::before {
  opacity: 1;
}

.kb-content {
  flex: 1;
}

.kb-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #303133;
}

.kb-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.kb-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.kb-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 上传步骤 */
.upload-steps {
  margin-bottom: 30px;
}

.step-content {
  min-height: 300px;
  padding: 20px 0;
}

/* 解析视图 */
.parsing-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.parsing-left h4,
.parsing-right h4 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
}

.document-preview {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.preview-text {
  font-family: '仿宋', 'FangSong', serif;
  line-height: 2;
  color: #606266;
}

.clauses-list {
  max-height: 400px;
  overflow-y: auto;
}

.clause-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 12px;
}

.clause-content strong {
  display: block;
  margin-bottom: 8px;
  color: #303133;
}

.clause-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 对话容器 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.message.user .message-content {
  background: #1890FF;
  color: white;
}

.message-text {
  line-height: 1.6;
}

.message-source {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-input {
  padding: 0;
}
</style>
