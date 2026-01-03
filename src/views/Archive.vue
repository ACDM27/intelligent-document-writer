<template>
  <div class="archive-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>归档检索</h1>
        <p>智能检索历史文档，一键复刻优质模板</p>
      </div>
      <div class="header-actions">
        <el-button @click="showAdvancedSearch = true">
          <el-icon><Filter /></el-icon>
          高级检索
        </el-button>
      </div>
    </div>

    <!-- 智能搜索栏 -->
    <div class="search-section">
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          size="large"
          placeholder="输入自然语言搜索，例如：去年关于五一放假的通知"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
        <div class="search-tips">
          <el-icon><InfoFilled /></el-icon>
          <span>支持自然语言搜索、关键词检索、结构化筛选</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧导航树 -->
      <div class="nav-tree">
        <el-tabs v-model="navMode">
          <el-tab-pane label="时间维度" name="time">
            <el-tree
              :data="timeTree"
              :props="{ label: 'label', children: 'children' }"
              @node-click="handleTreeClick"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                  <span>{{ node.label }}</span>
                  <el-tag v-if="data.count" size="small" type="info">{{ data.count }}</el-tag>
                </span>
              </template>
            </el-tree>
          </el-tab-pane>
          <el-tab-pane label="组织维度" name="org">
            <el-tree
              :data="orgTree"
              :props="{ label: 'label', children: 'children' }"
              @node-click="handleTreeClick"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                  <span>{{ node.label }}</span>
                  <el-tag v-if="data.count" size="small" type="info">{{ data.count }}</el-tag>
                </span>
              </template>
            </el-tree>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧文档列表 -->
      <div class="document-area">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <div class="filter-tags">
            <el-tag
              v-for="filter in activeFilters"
              :key="filter.key"
              closable
              @close="handleRemoveFilter(filter)"
            >
              {{ filter.label }}
            </el-tag>
          </div>
          <div class="filter-actions">
            <el-select v-model="sortBy" size="small" style="width: 150px">
              <el-option label="归档时间" value="archiveDate" />
              <el-option label="浏览次数" value="viewCount" />
              <el-option label="复刻次数" value="cloneCount" />
            </el-select>
          </div>
        </div>

        <!-- 文档列表 -->
        <div class="document-list">
          <div
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="doc-item"
            @click="handleViewDocument(doc)"
          >
            <div class="doc-header">
              <div class="doc-title-row">
                <h3>{{ doc.title }}</h3>
                <el-tag :type="getSecurityType(doc.securityLevel)" size="small">
                  {{ doc.securityLevel }}
                </el-tag>
              </div>
              <div class="doc-number">{{ doc.docNumber }}</div>
            </div>

            <div class="doc-body">
              <div class="doc-summary">
                <el-icon><Document /></el-icon>
                <span>{{ doc.summary }}</span>
              </div>

              <div class="doc-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ doc.creator }}
                </span>
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ doc.archiveDate }}
                </span>
                <span class="meta-item">
                  <el-icon><FolderOpened /></el-icon>
                  {{ doc.department }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ doc.viewCount }} 次浏览
                </span>
                <span class="meta-item">
                  <el-icon><CopyDocument /></el-icon>
                  {{ doc.cloneCount }} 次复刻
                </span>
              </div>

              <div class="doc-tags">
                <el-tag
                  v-for="tag in doc.tags"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  #{{ tag }}
                </el-tag>
              </div>
            </div>

            <div class="doc-footer">
              <el-button size="small" @click.stop="handleViewDocument(doc)">
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button size="small" type="primary" @click.stop="handleCloneDocument(doc)">
                <el-icon><CopyDocument /></el-icon>
                复刻此文
              </el-button>
              <el-button size="small" @click.stop="handleViewReferences(doc)">
                <el-icon><Link /></el-icon>
                查看依据
              </el-button>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="filteredDocuments.length === 0" description="未找到相关文档">
            <el-button type="primary" @click="handleClearFilters">清除筛选条件</el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 高级检索对话框 -->
    <el-dialog v-model="showAdvancedSearch" title="高级检索" width="700px">
      <el-form :model="advancedForm" label-width="100px">
        <el-form-item label="文书类型">
          <el-select v-model="advancedForm.type" multiple placeholder="请选择">
            <el-option label="行政公文" value="行政公文" />
            <el-option label="科研材料" value="科研材料" />
            <el-option label="教学材料" value="教学材料" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布部门">
          <el-select v-model="advancedForm.department" multiple placeholder="请选择">
            <el-option label="教务处" value="教务处" />
            <el-option label="科研处" value="科研处" />
            <el-option label="计算机学院" value="计算机学院" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="advancedForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item label="包含附件">
          <el-switch v-model="advancedForm.hasAttachment" />
        </el-form-item>

        <el-form-item label="密级">
          <el-radio-group v-model="advancedForm.securityLevel">
            <el-radio label="">全部</el-radio>
            <el-radio label="公开">公开</el-radio>
            <el-radio label="内部">内部</el-radio>
            <el-radio label="秘密">秘密</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAdvancedSearch = false">取消</el-button>
        <el-button type="primary" @click="handleAdvancedSearch">搜索</el-button>
      </template>
    </el-dialog>

    <!-- 文档详情对话框 -->
    <el-dialog v-model="showDocDetail" :title="currentDoc?.title" width="900px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文号">{{ currentDoc?.docNumber }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentDoc?.type }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentDoc?.department }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ currentDoc?.creator }}</el-descriptions-item>
        <el-descriptions-item label="归档日期">{{ currentDoc?.archiveDate }}</el-descriptions-item>
        <el-descriptions-item label="密级">
          <el-tag :type="getSecurityType(currentDoc?.securityLevel)">
            {{ currentDoc?.securityLevel }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="doc-structure" v-if="currentDoc?.structure">
        <h4>文档结构</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(section, index) in currentDoc.structure.sections"
            :key="index"
          >
            {{ section }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="doc-references" v-if="currentDoc?.references">
        <h4>引用依据</h4>
        <div
          v-for="ref in currentDoc.references"
          :key="ref.id"
          class="ref-item"
        >
          <el-icon><Link /></el-icon>
          <span>{{ ref.title }}</span>
          <el-tag size="small" type="info">{{ ref.type }}</el-tag>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDocDetail = false">关闭</el-button>
        <el-button type="primary" @click="handleCloneDocument(currentDoc)">
          <el-icon><CopyDocument /></el-icon>
          复刻此文
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import archiveData from '@/mock/archive_data.json'

const router = useRouter()

// 数据
const documents = ref([])
const searchQuery = ref('')
const navMode = ref('time')
const sortBy = ref('archiveDate')
const activeFilters = ref([])
const showAdvancedSearch = ref(false)
const showDocDetail = ref(false)
const currentDoc = ref(null)

// 高级检索表单
const advancedForm = ref({
  type: [],
  department: [],
  dateRange: null,
  hasAttachment: false,
  securityLevel: ''
})

// 时间维度树
const timeTree = ref([
  {
    label: '2026年',
    icon: 'Calendar',
    count: 45,
    children: [
      { label: '春季学期', count: 25, children: [
        { label: '1月', count: 8 },
        { label: '2月', count: 10 },
        { label: '3月', count: 7 }
      ]}
    ]
  },
  {
    label: '2025年',
    icon: 'Calendar',
    count: 156,
    children: [
      { label: '秋季学期', count: 78, children: [
        { label: '9月', count: 25 },
        { label: '10月', count: 28 },
        { label: '11月', count: 15 },
        { label: '12月', count: 10 }
      ]},
      { label: '春季学期', count: 78 }
    ]
  }
])

// 组织维度树
const orgTree = ref([
  {
    label: '教务处',
    icon: 'OfficeBuilding',
    count: 89,
    children: [
      { label: '教学管理', count: 45 },
      { label: '考务管理', count: 28 },
      { label: '实践教学', count: 16 }
    ]
  },
  {
    label: '科研处',
    icon: 'OfficeBuilding',
    count: 67,
    children: [
      { label: '项目申报', count: 35 },
      { label: '成果管理', count: 22 },
      { label: '学术交流', count: 10 }
    ]
  },
  {
    label: '计算机学院',
    icon: 'OfficeBuilding',
    count: 52
  }
])

// 加载数据
onMounted(() => {
  documents.value = archiveData
})

// 过滤后的文档
const filteredDocuments = computed(() => {
  let result = documents.value

  // 按关键词搜索
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    result = result.filter(doc =>
      doc.title.toLowerCase().includes(keyword) ||
      doc.summary.toLowerCase().includes(keyword) ||
      doc.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      doc.docNumber.toLowerCase().includes(keyword)
    )
  }

  // 按筛选条件
  activeFilters.value.forEach(filter => {
    if (filter.field === 'year' || filter.field === 'month' || filter.field === 'semester') {
      result = result.filter(doc => doc[filter.field] === filter.value)
    } else if (filter.field === 'department') {
      result = result.filter(doc => doc.department === filter.value)
    } else if (filter.field === 'type') {
      result = result.filter(doc => doc.type === filter.value)
    }
  })

  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'archiveDate') {
      return new Date(b.archiveDate) - new Date(a.archiveDate)
    } else if (sortBy.value === 'viewCount') {
      return b.viewCount - a.viewCount
    } else if (sortBy.value === 'cloneCount') {
      return b.cloneCount - a.cloneCount
    }
    return 0
  })

  return result
})

// 获取密级类型
const getSecurityType = (level) => {
  const typeMap = {
    '公开': 'success',
    '内部': 'warning',
    '秘密': 'danger'
  }
  return typeMap[level] || ''
}

// 搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  ElMessage.success(`正在搜索：${searchQuery.value}`)
}

// 树节点点击
const handleTreeClick = (data) => {
  // 判断节点类型并添加筛选条件
  if (data.label.includes('年')) {
    // 年份节点
    const year = data.label.replace('年', '')
    addFilter('year', year, `年份：${year}`)
  } else if (data.label.includes('学期')) {
    // 学期节点
    addFilter('semester', data.label, `学期：${data.label}`)
  } else if (data.label.includes('月')) {
    // 月份节点
    const month = data.label.replace('月', '')
    addFilter('month', month, `月份：${month}月`)
  } else if (orgTree.value.some(org => org.label === data.label)) {
    // 部门节点
    addFilter('department', data.label, `部门：${data.label}`)
  }
}

// 添加筛选条件
const addFilter = (field, value, label) => {
  const key = `${field}_${value}`
  if (!activeFilters.value.find(f => f.key === key)) {
    activeFilters.value.push({ key, field, value, label })
    ElMessage.success(`已添加筛选：${label}`)
  }
}

// 移除筛选条件
const handleRemoveFilter = (filter) => {
  const index = activeFilters.value.findIndex(f => f.key === filter.key)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  }
}

// 清除筛选条件
const handleClearFilters = () => {
  activeFilters.value = []
  searchQuery.value = ''
  ElMessage.info('已清除所有筛选条件')
}

// 高级检索
const handleAdvancedSearch = () => {
  // 清除现有筛选
  activeFilters.value = []
  
  // 添加文书类型筛选
  if (advancedForm.value.type.length > 0) {
    advancedForm.value.type.forEach(type => {
      addFilter('type', type, `类型：${type}`)
    })
  }
  
  // 添加部门筛选
  if (advancedForm.value.department.length > 0) {
    advancedForm.value.department.forEach(dept => {
      addFilter('department', dept, `部门：${dept}`)
    })
  }
  
  // 添加密级筛选
  if (advancedForm.value.securityLevel) {
    addFilter('securityLevel', advancedForm.value.securityLevel, `密级：${advancedForm.value.securityLevel}`)
  }
  
  showAdvancedSearch.value = false
  ElMessage.success('高级检索完成')
}

// 查看文档
const handleViewDocument = (doc) => {
  currentDoc.value = doc
  showDocDetail.value = true
}

// 复刻文档
const handleCloneDocument = (doc) => {
  ElMessage.success(`正在复刻《${doc.title}》的结构...`)
  setTimeout(() => {
    router.push('/writer?cloneFrom=' + doc.id)
  }, 1000)
}

// 查看引用依据
const handleViewReferences = (doc) => {
  currentDoc.value = doc
  showDocDetail.value = true
}
</script>

<style scoped>
.archive-page {
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

/* 搜索区 */
.search-section {
  margin-bottom: 24px;
}

.search-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}

/* 主内容区 */
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* 导航树 */
.nav-tree {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: fit-content;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

/* 文档区域 */
.document-area {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 文档列表 */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doc-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.doc-item:hover {
  border-color: #1890FF;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.doc-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.doc-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.doc-title-row h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  flex: 1;
}

.doc-number {
  font-size: 13px;
  color: #909399;
}

.doc-body {
  margin-bottom: 16px;
}

.doc-summary {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.doc-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.doc-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.doc-footer {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 文档结构 */
.doc-structure,
.doc-references {
  margin-top: 24px;
}

.doc-structure h4,
.doc-references h4 {
  margin: 0 0 16px;
  font-size: 15px;
  color: #303133;
}

.ref-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 8px;
}
</style>
