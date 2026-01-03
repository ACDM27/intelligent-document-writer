<template>
  <div class="red-header-doc" :class="`header-type-${headerType}`" ref="docContainer">
    <div class="a4-paper">
      <!-- 红头标题区 -->
      <div class="header-section">
        <!-- 红线 -->
        <div class="red-line top-line"></div>
        
        <!-- 发文单位（红头） -->
        <div class="doc-title document-title">
          {{ getSenderName() }}
        </div>
        
        <!-- 红线 -->
        <div class="red-line bottom-line"></div>
      </div>

      <!-- 文号和标题 -->
      <div class="doc-meta">
        <div class="doc-number">{{ content?.doc_number || '' }}</div>
        <div class="main-title">{{ content?.title || '' }}</div>
      </div>

      <!-- 正文内容 -->
      <div class="doc-body document-content">
        <div v-for="(paragraph, index) in displayParagraphs" :key="index" class="paragraph">
          {{ paragraph }}
        </div>
      </div>

      <!-- 印章（可选） -->
      <div v-if="showSeal" class="seal-container">
        <img src="/seal.png" alt="公章" class="seal-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    default: () => ({})
  },
  headerType: {
    type: String,
    default: 'admin', // 'admin' | 'party' | 'letter'
    validator: (value) => ['admin', 'party', 'letter'].includes(value)
  },
  showSeal: {
    type: Boolean,
    default: false
  },
  displayText: {
    type: String,
    default: ''
  }
})

const docContainer = ref(null)

// 根据红头类型返回发文单位名称
const getSenderName = () => {
  const names = {
    admin: '广西警察学院',
    party: '中共广西警察学院委员会',
    letter: '广西警察学院'
  }
  return names[props.headerType] || '广西警察学院'
}

// 显示的段落（支持打字机效果）
const displayParagraphs = computed(() => {
  if (props.displayText) {
    // 打字机模式 - 将 displayText 按段落分割
    return props.displayText.split('\n').filter(p => p.trim())
  }
  return props.content?.paragraphs || []
})
</script>

<style scoped>
.red-header-doc {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: var(--bg-color);
  min-height: 100vh;
}

/* A4 纸张 */
.a4-paper {
  width: 210mm;
  min-height: 297mm;
  background: white;
  padding: 37mm 28mm 35mm 28mm; /* 上37mm 左右28mm 下35mm */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 红头标题区 */
.header-section {
  text-align: center;
  margin-bottom: 20px;
}

/* 红线 */
.red-line {
  height: 1.5pt;
  background: var(--danger-color);
  margin: 8px auto;
}

.top-line {
  width: 120pt;
}

.bottom-line {
  width: 120pt;
}

/* 红头标题 */
.doc-title {
  font-size: 22pt;
  font-weight: bold;
  color: var(--danger-color);
  font-family: 'SimHei', 'STHeiti', 'Microsoft YaHei', sans-serif;
  margin: 10px 0;
  letter-spacing: 2px;
}

/* 文号和标题 */
.doc-meta {
  text-align: center;
  margin-bottom: 30px;
}

.doc-number {
  font-size: 16pt;
  font-family: 'FangSong', 'STFangsong', serif;
  margin-bottom: 15px;
}

.main-title {
  font-size: 22pt;
  font-family: 'SimHei', 'STHeiti', 'Microsoft YaHei', sans-serif;
  font-weight: bold;
  margin: 20px 0;
}

/* 正文 */
.doc-body {
  font-family: 'FangSong', 'STFangsong', serif;
  font-size: 16pt;
  line-height: 2;
  text-align: justify;
}

.paragraph {
  text-indent: 2em;
  margin-bottom: 0;
}

.paragraph:first-child {
  text-indent: 0;
}

/* 印章 */
.seal-container {
  position: absolute;
  bottom: 100px;
  right: 80px;
  animation: sealFadeIn 0.5s ease-in;
}

.seal-image {
  width: 100px;
  height: 100px;
  opacity: 0.85;
}

@keyframes sealFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 0.85;
    transform: scale(1);
  }
}

/* 响应式 - 小屏幕适配 */
@media screen and (max-width: 800px) {
  .a4-paper {
    width: 100%;
    min-height: auto;
    padding: 20px;
  }
}

/* 不同红头类型的样式变化 */
.header-type-party .doc-title {
  color: var(--danger-color);
}

.header-type-letter .doc-title {
  font-size: 18pt;
  color: var(--text-primary);
}

.header-type-letter .red-line {
  background: var(--text-secondary);
}
</style>
