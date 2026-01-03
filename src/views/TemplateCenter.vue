<template>
  <div class="template-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>模板中心</h1>
        <p>选择适合您的文书模板，快速生成规范文档</p>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板..."
          prefix-icon="Search"
          clearable
          style="width: 300px;"
        />
      </div>
    </div>

    <!-- 分类标签页 -->
    <el-tabs v-model="activeCategory" class="category-tabs">
      <el-tab-pane
        v-for="cat in categories"
        :key="cat.value"
        :label="cat.label"
        :name="cat.value"
      >
        <template #label>
          <span class="tab-label">
            <el-icon><component :is="cat.icon" /></el-icon>
            {{ cat.label }}
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 筛选器 -->
    <div class="filter-bar">
      <el-space wrap>
        <span class="filter-label">级别：</span>
        <el-radio-group v-model="filterLevel" size="small">
          <el-radio-button label="全部">全部</el-radio-button>
          <el-radio-button label="校级红头">校级红头</el-radio-button>
          <el-radio-button label="院级红头">院级红头</el-radio-button>
          <el-radio-button label="党委红头">党委红头</el-radio-button>
          <el-radio-button label="便函">便函</el-radio-button>
        </el-radio-group>

        <el-divider direction="vertical" />

        <span class="filter-label">来源：</span>
        <el-radio-group v-model="filterSource" size="small">
          <el-radio-button label="全部">全部</el-radio-button>
          <el-radio-button label="教育部标准">教育部标准</el-radio-button>
          <el-radio-button label="校标2026版">校标2026版</el-radio-button>
          <el-radio-button label="自定义">自定义</el-radio-button>
        </el-radio-group>

        <el-divider direction="vertical" />

        <span class="filter-label">排序：</span>
        <el-select v-model="sortBy" size="small" style="width: 120px;">
          <el-option label="最热门" value="usage" />
          <el-option label="最新" value="date" />
          <el-option label="名称" value="name" />
        </el-select>
      </el-space>
    </div>

    <!-- 模板卡片网格 -->
    <div class="template-grid">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="handleTemplateClick(template)"
      >
        <!-- 文字预览区 -->
        <div class="card-preview">
          <div class="preview-text">
            <h4>{{ template.previewContent?.title || template.title }}</h4>
            <p class="preview-snippet">
              {{ getPreviewSnippet(template) }}
            </p>
          </div>
          <div class="header-type-badge" :class="`badge-${template.headerType}`">
            {{ getHeaderTypeName(template.headerType) }}
          </div>
        </div>

        <div class="card-content">
          <h3 class="card-title">{{ template.title }}</h3>
          <p class="card-desc">{{ template.description }}</p>

          <div class="card-tags">
            <el-tag size="small" type="info">{{ template.level }}</el-tag>
            <el-tag size="small" type="success" v-if="template.season !== '通用'">
              {{ template.season }}
            </el-tag>
            <el-tag
              size="small"
              v-for="tag in template.tags"
              :key="tag"
              :type="tag === '高频使用' ? 'danger' : ''"
            >
              {{ tag }}
            </el-tag>
          </div>

          <div class="card-footer">
            <span class="usage-count">
              <el-icon><View /></el-icon>
              全校引用 {{ template.usageCount.toLocaleString() }} 次
            </span>
            <div class="card-actions">
              <el-button size="small" type="primary" @click.stop="handleUseTemplate(template)">
                使用
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="filteredTemplates.length === 0"
      description="暂无符合条件的模板"
    >
      <el-button type="primary" @click="resetFilters">重置筛选</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import templatesData from '@/mock/templates.json'

const router = useRouter()

// 数据
const templates = ref([])
const activeCategory = ref('全部')
const searchKeyword = ref('')
const filterLevel = ref('全部')
const filterSource = ref('全部')
const sortBy = ref('usage')

// 分类定义
const categories = [
  { label: '全部', value: '全部', icon: 'Grid' },
  { label: '行政公文', value: '行政公文', icon: 'Document' },
  { label: '党务文书', value: '党务文书', icon: 'Flag' },
  { label: '科研业务', value: '科研业务', icon: 'Reading' },
  { label: '教学教务', value: '教学教务', icon: 'School' },
  { label: '学生工作', value: '学生工作', icon: 'User' }
]

// 加载数据
onMounted(() => {
  templates.value = templatesData
})

// 筛选后的模板
const filteredTemplates = computed(() => {
  let result = templates.value

  // 按分类筛选
  if (activeCategory.value !== '全部') {
    result = result.filter(t => t.category === activeCategory.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(keyword) ||
      t.description.toLowerCase().includes(keyword)
    )
  }

  // 按级别筛选
  if (filterLevel.value !== '全部') {
    result = result.filter(t => t.level === filterLevel.value)
  }

  // 按来源筛选
  if (filterSource.value !== '全部') {
    result = result.filter(t => t.source === filterSource.value)
  }

  // 排序
  if (sortBy.value === 'usage') {
    result.sort((a, b) => b.usageCount - a.usageCount)
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  }

  return result
})

// 获取红头类型名称
const getHeaderTypeName = (type) => {
  const names = {
    admin: '行政',
    party: '党委',
    letter: '便函'
  }
  return names[type] || type
}

// 获取预览片段
const getPreviewSnippet = (template) => {
  if (template.previewContent?.content) {
    return template.previewContent.content.substring(0, 100) + '...'
  }
  return template.description
}

// 重置筛选
const resetFilters = () => {
  activeCategory.value = '全部'
  searchKeyword.value = ''
  filterLevel.value = '全部'
  filterSource.value = '全部'
  sortBy.value = 'usage'
}

// 点击模板卡片 - 跳转到预览页面
const handleTemplateClick = (template) => {
  router.push(`/templates/${template.id}`)
}

// 使用模板
const handleUseTemplate = (template) => {
  ElMessage.success(`已选择模板：${template.title}`)
  router.push({
    path: '/writer',
    query: {
      templateId: template.id
    }
  })
}
</script>

<style scoped>
.template-center {
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

/* 分类标签页 */
.category-tabs {
  background: white;
  padding: 0 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 模板网格 */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* 模板卡片 */
.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 文字预览区 */
.card-preview {
  height: 180px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.preview-text {
  font-family: '仿宋', 'FangSong', serif;
  color: #303133;
}

.preview-text h4 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.preview-snippet {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  text-indent: 2em;
}

.header-type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.badge-admin {
  background: linear-gradient(135deg, #1890FF 0%, #096dd9 100%);
}

.badge-party {
  background: linear-gradient(135deg, #FF4D4F 0%, #CF1322 100%);
}

.badge-letter {
  background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
}

.card-content {
  padding: 20px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.usage-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.card-actions {
  display: flex;
  gap: 8px;
}

/* 预览对话框 */
.preview-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  max-height: 600px;
}

.preview-info {
  overflow-y: auto;
}

.structure-section {
  margin-top: 24px;
}

.structure-section h4 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
}

.preview-demo {
  overflow-y: auto;
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.preview-demo h4 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
}

.demo-document {
  background: white;
  padding: 20px;
  border-radius: 8px;
  transform: scale(0.7);
  transform-origin: top left;
}
</style>
