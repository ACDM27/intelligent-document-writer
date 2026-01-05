<template>
  <div class="smart-writer-page">
    <!-- 左侧步骤导航 -->
    <aside class="sidebar">
      <div class="logo-section">
        <h1>智能创作台</h1>
        <p>AI驱动的公文生成</p>
      </div>
      
      <el-steps direction="vertical" :active="currentStep" class="step-nav">
        <el-step
          v-for="(title, index) in stepTitles"
          :key="index"
          :title="`步骤${index + 1}`"
          :description="title"
        />
      </el-steps>

      <el-button @click="goBack" class="back-btn" text>
        <el-icon><ArrowLeft /></el-icon> 返回工作台
      </el-button>
    </aside>

    <!-- 右侧内容区 -->
    <main class="content-area">
      <el-card class="step-card">
        <!-- Step 1: 需求录入 -->
        <div v-if="currentStep === 0" class="step-content">
          <h2>需求录入</h2>
          
          <el-tabs v-model="stepData.inputType">
            <el-tab-pane label="上传参考文件" name="upload">
              <el-upload
                class="upload-demo"
                drag
                multiple
                :auto-upload="false"
                :on-change="handleFileChange"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em><br>
                  <span class="upload-tip">支持上传上级红头文件图片、会议录音稿等</span>
                </div>
              </el-upload>
            </el-tab-pane>

            <el-tab-pane label="手写需求" name="manual">
              <el-input
                v-model="stepData.userInput"
                type="textarea"
                :rows="8"
                placeholder="请输入文书需求，例如：撰写一份关于举办AI教学培训的通知..."
              />
            </el-tab-pane>
          </el-tabs>

          <div class="config-section">
            <el-form label-width="100px">
              <el-form-item label="业务类型">
                <el-radio-group v-model="stepData.businessType">
                  <el-radio label="行政类">行政类</el-radio>
                  <el-radio label="党务类">党务类</el-radio>
                  <el-radio label="教学类">教学类</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="关联知识库">
                <el-select v-model="stepData.knowledgeBase" multiple placeholder="请选择">
                  <el-option label="2025本科教学管理规定" value="teaching_2025" />
                  <el-option label="差旅报销标准" value="travel_standard" />
                  <el-option label="公文处理办法" value="doc_rules" />
                </el-select>
              </el-form-item>

              <el-form-item label="篇幅控制">
                <el-slider
                  v-model="stepData.wordCount"
                  :min="500"
                  :max="3000"
                  :step="500"
                  :marks="{ 500: '短篇', 1500: '中篇', 3000: '长篇' }"
                  show-stops
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="step-actions">
            <el-button type="primary" :disabled="!canNextStep" @click="handleStep1Next">
              下一步：生成大纲
            </el-button>
          </div>
        </div>

        <!-- Step 2: 大纲确认 -->
        <div v-if="currentStep === 1" class="step-content">
          <h2>大纲确认</h2>
          <p class="step-desc">您可以编辑、调整大纲结构</p>

          <el-tree
            :data="stepData.outline"
            node-key="label"
            default-expand-all
            draggable
            :allow-drop="allowDrop"
            class="outline-tree"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon><Document /></el-icon>
                <span>{{ data.label }}</span>
              </span>
            </template>
          </el-tree>

          <div class="step-actions">
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" :loading="isGenerating" @click="handleGenerateContent">
              {{ isGenerating ? '正在生成...' : '生成正文' }}
            </el-button>
          </div>
        </div>

        <!-- Step 3: 智能撰写 -->
        <div v-if="currentStep === 2" class="step-content full-height">
          <div class="generation-container">
            <!-- 左侧 AI 交互区 -->
            <div class="ai-panel">
              <el-card class="info-card" shadow="never">
                <template #header>
                  <div class="card-header">
                    <el-icon><Document /></el-icon>
                    <span>引用依据</span>
                  </div>
                </template>
                <ul class="reference-list">
                  <li v-for="(ref, index) in currentReferences" :key="index">
                    {{ ref }}
                  </li>
                </ul>
              </el-card>

              <el-card class="info-card" shadow="never" style="margin-top: 20px;">
                <template #header>
                  <div class="card-header">
                    <el-icon><Loading /></el-icon>
                    <span>AI 思考过程</span>
                  </div>
                </template>
                <ul class="log-list">
                  <li v-for="(log, index) in visibleLogs" :key="index" class="log-item">
                    <el-icon color="#67C23A"><CircleCheck /></el-icon>
                    {{ log }}
                  </li>
                </ul>
              </el-card>
            </div>

            <!-- 右侧红头预览区 -->
            <div class="preview-panel" ref="previewContainer">
              <RedHeaderDoc
                :content="stepData.generatedContent"
                :display-text="displayText"
                :header-type="stepData.headerType"
                :show-seal="false"
              />
            </div>
          </div>

          <div class="step-actions">
            <el-button @click="prevStep">上一步</el-button>
            <el-button v-if="isTyping" @click="skipTyping">跳过动画</el-button>
            <el-button type="primary" :disabled="isTyping" @click="nextStep">
              下一步：排版归档
            </el-button>
          </div>
        </div>

        <!-- Step 4: 排版归档 -->
        <div v-if="currentStep === 3" class="step-content full-height">
          <div class="toolbar">
            <el-space>
              <span>红头类型：</span>
              <el-radio-group v-model="stepData.headerType" size="small">
                <el-radio-button label="admin">行政红头</el-radio-button>
                <el-radio-button label="party">党委红头</el-radio-button>
                <el-radio-button label="letter">便函</el-radio-button>
              </el-radio-group>

              <el-divider direction="vertical" />

              <span>盖章：</span>
              <el-switch v-model="stepData.showSeal" />
            </el-space>
          </div>

          <div class="preview-panel final-preview" ref="finalPreviewContainer">
            <RedHeaderDoc
              :content="stepData.generatedContent"
              :header-type="stepData.headerType"
              :show-seal="stepData.showSeal"
            />
          </div>

          <div class="step-actions">
            <el-button @click="prevStep">上一步</el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon> 导出 Word
            </el-button>
            <el-button type="primary" @click="handleSubmitApproval">
              <el-icon><Select /></el-icon> 发起审批
            </el-button>
          </div>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSteps } from '@/composables/useSteps'
import { useTypewriter } from '@/composables/useTypewriter'
import RedHeaderDoc from '@/components/RedHeaderDoc.vue'
import { exportToWord } from '@/utils/exportWord'
import scenariosData from '@/mock/scenarios.json'
import generationData from '@/mock/generation_stream.json'

const router = useRouter()
const route = useRoute()

const {
  currentStep,
  stepData,
  stepTitles,
  canNextStep,
  nextStep,
  prevStep
} = useSteps()

const isGenerating = ref(false)
const currentReferences = ref([])
const visibleLogs = ref([])
const previewContainer = ref(null)

// 打字机效果
const { displayText, isTyping, start: startTyping, skip: skipTyping } = useTypewriter({ speed: 30 })

// 初始化场景数据
onMounted(() => {
  const scenarioId = route.query.scenarioId || 'admin_notice'
  const scenario = scenariosData.find(s => s.id === scenarioId)
  
  if (scenario) {
    stepData.value.outline = scenario.outline_template
    stepData.value.knowledgeBase = scenario.default_kb || []
  }
})

// 处理文件变化
const handleFileChange = (file, fileList) => {
  stepData.value.files = fileList
}

// 允许拖拽
const allowDrop = () => true

// Step 1 下一步
const handleStep1Next = () => {
  nextStep()
}

// 生成正文
const handleGenerateContent = async () => {
  isGenerating.value = true
  
  // 模拟加载
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 获取生成的内容
  const scenarioId = route.query.scenarioId || 'admin_notice'
  const content = generationData[scenarioId]
  
  if (content) {
    stepData.value.generatedContent = content
    currentReferences.value = content.references || []
  }
  
  isGenerating.value = false
  nextStep()
  
  // 进入 Step 3 后开始打字机效果
  await nextTick()
  startAIThinking()
}

// 启动 AI 思考日志和打字机
const startAIThinking = async () => {
  const logs = stepData.value.generatedContent?.ai_thinking_logs || []
  
  // 逐条显示日志
  for (let i = 0; i < logs.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 300))
    visibleLogs.value.push(logs[i])
  }
  
  // 日志显示完毕后开始打字
  await new Promise(resolve => setTimeout(resolve, 500))
  const fullText = stepData.value.generatedContent.paragraphs.join('\n')
  startTyping(fullText, previewContainer.value)
}

// 导出 Word
const handleExport = async () => {
  try {
    await exportToWord(stepData.value.generatedContent, {
      headerType: stepData.value.headerType,
      showSeal: stepData.value.showSeal,
      fileName: stepData.value.generatedContent?.title || '公文'
    })
    ElMessage.success('Word文档导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('文档导出失败，请重试')
  }
}

// 发起审批
const handleSubmitApproval = () => {
  ElMessage.success('已提交教务处审核')
  setTimeout(() => {
    router.push('/')
  }, 1500)
}

// 返回工作台
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.smart-writer-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
}

/* 左侧边栏 */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1890FF 0%, #096dd9 100%);
  color: white;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
}

.logo-section {
  margin-bottom: 40px;
}

.logo-section h1 {
  font-size: 20px;
  margin: 0 0 5px;
}

.logo-section p {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
}

.step-nav {
  flex: 1;
}

:deep(.el-step__title) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

:deep(.el-step__description) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-step__head.is-process) {
  color: white;
  border-color: white;
}

:deep(.el-step__title.is-process) {
  color: white;
  font-weight: bold;
}

.back-btn {
  margin-top: 20px;
  color: white;
}

/* 内容区 */
.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.step-card {
  min-height: calc(100vh - 60px);
  border-radius: var(--border-radius);
}

.step-content {
  padding: 20px;
}

.step-content h2 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.step-desc {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* 配置区 */
.config-section {
  margin-top: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.upload-tip {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 大纲树 */
.outline-tree {
  margin: 20px 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 步骤操作按钮 */
.step-actions {
  margin-top: 30px;
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

/* Step 3: 生成区域 */
.full-height {
  height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
}

.generation-container {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.ai-panel {
  width: 300px;
  overflow-y: auto;
}

.preview-panel {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-color);
  border-radius: 8px;
}

.info-card {
  background: #f9f9f9;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.reference-list, .log-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reference-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  font-size: 13px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  color: var(--text-secondary);
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Step 4: 工具栏 */
.toolbar {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.final-preview {
  height: calc(100vh - 320px);
}
</style>
