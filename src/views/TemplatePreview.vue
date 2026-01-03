<template>
  <div class="template-preview-page">
    <!-- 顶部导航 -->
    <div class="preview-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回模板中心
      </el-button>
      <div class="header-actions">
        <el-button @click="handleCollect">
          <el-icon><Star /></el-icon>
          收藏模板
        </el-button>
        <el-button type="primary" @click="handleUseTemplate">
          使用此模板
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="preview-container" v-if="template">
      <!-- 左侧信息栏 -->
      <aside class="info-sidebar">
        <div class="template-meta">
          <h2>{{ template.title }}</h2>
          <p class="meta-desc">{{ template.description }}</p>

          <el-divider />

          <!-- 模板分类 -->
          <div class="meta-section">
            <h4>模板分类</h4>
            <p>{{ template.category }} / {{ template.subCategory }}</p>
          </div>

          <!-- 发文机关 -->
          <div class="meta-section">
            <h4>发文机关</h4>
            <p>{{ template.issuer }}</p>
          </div>

          <!-- 级别 -->
          <div class="meta-section">
            <h4>级别</h4>
            <el-tag :type="getLevelType(template.level)">{{ template.level }}</el-tag>
          </div>

          <!-- 来源 -->
          <div class="meta-section">
            <h4>来源</h4>
            <el-tag type="info">{{ template.source }}</el-tag>
          </div>

          <!-- 使用次数 -->
          <div class="meta-section">
            <h4>使用次数</h4>
            <p class="usage-stat">
              <el-icon color="#1890FF"><View /></el-icon>
              全校引用 <strong>{{ template.usageCount.toLocaleString() }}</strong> 次
            </p>
          </div>

          <el-divider />

          <!-- 文档结构 -->
          <div class="meta-section">
            <h4>文档结构</h4>
            <ul class="structure-list">
              <li
                v-for="section in template.structure.sections"
                :key="section.id"
                class="structure-item"
              >
                <el-icon :color="section.required ? '#1890FF' : '#909399'">
                  <component :is="section.required ? 'CircleCheckFilled' : 'CircleCheck'" />
                </el-icon>
                <span>{{ section.title }}</span>
                <el-tag v-if="section.required" size="small" type="danger">必填</el-tag>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- 右侧预览区 -->
      <main class="preview-main">
        <div class="preview-title">
          <h3>模板预览</h3>
          <el-radio-group v-model="previewMode" size="small">
            <el-radio-button label="document">文档视图</el-radio-button>
            <el-radio-button label="text">纯文本</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 文档视图 -->
        <div v-if="previewMode === 'document'" class="document-preview">
          <RedHeaderDoc
            v-if="template.previewContent"
            :header-type="template.headerType"
            :content="{
              title: template.previewContent.title,
              doc_number: template.previewContent.docNumber,
              sender: template.issuer,
              date: template.previewContent.date,
              recipients: template.previewContent.recipients,
              paragraphs: template.previewContent.content.split('\n\n')
            }"
            :show-seal="true"
          />
          <div v-else class="no-preview">
            <el-empty description="暂无预览内容" />
          </div>
        </div>

        <!-- 纯文本视图 -->
        <div v-else class="text-preview">
          <div class="text-content">
            <h2>{{ template.previewContent?.title }}</h2>
            <p class="doc-number">{{ template.previewContent?.docNumber }}</p>
            <div class="text-body">
              <p v-for="(para, index) in template.previewContent?.content.split('\n\n')" :key="index">
                {{ para }}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import RedHeaderDoc from '@/components/RedHeaderDoc.vue'
import templatesData from '@/mock/templates.json'

const router = useRouter()
const route = useRoute()

const template = ref(null)
const previewMode = ref('document')

// 加载模板数据
onMounted(() => {
  const templateId = route.params.id
  template.value = templatesData.find(t => t.id === templateId)
  
  if (!template.value) {
    ElMessage.error('模板不存在')
    router.push('/templates')
  }
})

// 获取级别类型
const getLevelType = (level) => {
  const typeMap = {
    '校级红头': 'danger',
    '院级红头': 'warning',
    '党委红头': 'danger',
    '便函': 'success'
  }
  return typeMap[level] || ''
}

// 返回
const goBack = () => {
  router.push('/templates')
}

// 收藏模板
const handleCollect = () => {
  ElMessage.success('已收藏模板')
}

// 使用模板
const handleUseTemplate = () => {
  ElMessage.success(`已选择模板：${template.value.title}`)
  router.push({
    path: '/writer',
    query: {
      templateId: template.value.id
    }
  })
}
</script>

<style scoped>
.template-preview-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部导航 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 主容器 */
.preview-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

/* 左侧信息栏 */
.info-sidebar {
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 80px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.template-meta h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #303133;
}

.meta-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.meta-section {
  margin-bottom: 20px;
}

.meta-section h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.meta-section p {
  margin: 0;
  font-size: 15px;
  color: #303133;
}

.usage-stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.usage-stat strong {
  color: #1890FF;
  font-size: 18px;
}

/* 文档结构列表 */
.structure-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.structure-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
  font-size: 14px;
}

.structure-item:last-child {
  border-bottom: none;
}

/* 右侧预览区 */
.preview-main {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.preview-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.preview-title h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

/* 文档预览 */
.document-preview {
  background: #f5f7fa;
  padding: 40px;
  border-radius: 8px;
  min-height: 800px;
}

.no-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* 纯文本预览 */
.text-preview {
  background: #fafafa;
  padding: 40px;
  border-radius: 8px;
  min-height: 800px;
}

.text-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 60px 80px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  font-family: '仿宋', 'FangSong', serif;
  line-height: 2;
}

.text-content h2 {
  text-align: center;
  font-size: 22px;
  margin: 0 0 20px;
  color: #303133;
}

.doc-number {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin: 0 0 40px;
}

.text-body p {
  margin: 0 0 20px;
  text-indent: 2em;
  font-size: 16px;
  color: #303133;
}

/* 加载状态 */
.loading-state {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
