<template>
  <div class="statistics-page">
    <div class="page-container">
      <!-- 视图切换标签 -->
      <el-tabs v-model="activeView" class="view-tabs">
        <el-tab-pane label="全局驾驶舱" name="global">
          <!-- 全局驾驶舱视图 -->
          <div class="global-view">
            <!-- KPI 卡片区 -->
            <el-row :gutter="24" class="kpi-cards">
              <el-col :span="6">
                <div class="kpi-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <el-icon :size="32"><Document /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">{{ globalData.kpi.totalDocuments.toLocaleString() }}</div>
                    <div class="kpi-label">累计生成文书</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="kpi-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <el-icon :size="32"><Clock /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">{{ globalData.kpi.savedHours.toLocaleString() }} <span class="kpi-unit">小时</span></div>
                    <div class="kpi-label">节省工时 (≈{{ globalData.kpi.savedDays }}人天)</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="kpi-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <el-icon :size="32"><User /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">{{ globalData.kpi.activeDepartments }} / {{ globalData.kpi.activeTeachers }}</div>
                    <div class="kpi-label">活跃部门 / 活跃教师</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="kpi-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                    <el-icon :size="32"><Warning /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">{{ globalData.kpi.complianceBlocks }}</div>
                    <div class="kpi-label">合规风险拦截</div>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 图表区域 -->
            <el-row :gutter="24" class="chart-section">
              <!-- 文书类型分布 -->
              <el-col :span="8">
                <div class="chart-card">
                  <h3 class="chart-title">文书类型分布</h3>
                  <v-chart :option="documentTypeOption" style="height: 300px;" autoresize />
                </div>
              </el-col>

              <!-- 部门使用排行 -->
              <el-col :span="16">
                <div class="chart-card">
                  <h3 class="chart-title">部门使用排行 Top 5</h3>
                  <v-chart :option="departmentRankingOption" style="height: 300px;" autoresize />
                </div>
              </el-col>
            </el-row>

            <!-- 时间趋势 -->
            <el-row :gutter="24" class="chart-section">
              <el-col :span="24">
                <div class="chart-card">
                  <h3 class="chart-title">文书生成趋势 (本学期 vs 去年同期)</h3>
                  <v-chart :option="timeTrendOption" style="height: 350px;" autoresize />
                </div>
              </el-col>
            </el-row>

            <!-- 高频模板和合规监控 -->
            <el-row :gutter="24" class="chart-section">
              <!-- 高频模板 Top 10 -->
              <el-col :span="12">
                <div class="chart-card">
                  <h3 class="chart-title">高频模板 Top 10</h3>
                  <el-table :data="globalData.topTemplates" class="template-table" stripe>
                    <el-table-column prop="rank" label="排名" width="60" align="center" />
                    <el-table-column prop="name" label="模板名称" min-width="180" />
                    <el-table-column prop="category" label="类别" width="100" align="center">
                      <template #default="{ row }">
                        <el-tag size="small">{{ row.category }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="count" label="使用次数" width="100" align="center" />
                  </el-table>
                </div>
              </el-col>

              <!-- 合规风险监控 -->
              <el-col :span="12">
                <div class="chart-card">
                  <h3 class="chart-title">合规风险监控</h3>
                  <div class="compliance-stats">
                    <div class="compliance-summary">
                      <div class="total-blocks">
                        <span class="number">{{ globalData.complianceRisks.totalBlocks }}</span>
                        <span class="label">累计拦截</span>
                      </div>
                      <div class="risk-types">
                        <div v-for="type in globalData.complianceRisks.types" :key="type.name" class="risk-item">
                          <div class="risk-name">{{ type.name }}</div>
                          <div class="risk-bar">
                            <div class="risk-progress" :style="{ width: type.percentage + '%' }"></div>
                          </div>
                          <div class="risk-count">{{ type.count }}次</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 引用溯源和质量指标 -->
            <el-row :gutter="24" class="chart-section">
              <!-- 引用溯源排行 -->
              <el-col :span="12">
                <div class="chart-card">
                  <h3 class="chart-title">引用溯源排行 Top 10</h3>
                  <el-table :data="globalData.referenceRanking" class="reference-table" stripe>
                    <el-table-column prop="rank" label="排名" width="60" align="center" />
                    <el-table-column prop="name" label="制度名称" min-width="200" />
                    <el-table-column prop="category" label="类别" width="100" align="center">
                      <template #default="{ row }">
                        <el-tag size="small" type="info">{{ row.category }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="count" label="引用次数" width="100" align="center" />
                  </el-table>
                </div>
              </el-col>

              <!-- 质量指标 -->
              <el-col :span="12">
                <div class="chart-card">
                  <h3 class="chart-title">质量与效能指标</h3>
                  <div class="quality-metrics">
                    <div class="metric-item">
                      <div class="metric-label">审阅通过率</div>
                      <el-progress :percentage="globalData.qualityMetrics.reviewPassRate" :stroke-width="12" />
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">定稿下载率</div>
                      <el-progress :percentage="globalData.qualityMetrics.downloadRate" :stroke-width="12" color="#67C23A" />
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">AI 采纳率</div>
                      <el-progress :percentage="globalData.qualityMetrics.aiAdoptionRate" :stroke-width="12" color="#E6A23C" />
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">平均生成耗时</div>
                      <div class="metric-value">{{ globalData.qualityMetrics.avgGenerationTime }} 秒</div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane label="个人报表" name="personal">
          <!-- 个人报表视图 -->
          <div class="personal-view">
            <!-- 个人效能卡片 -->
            <el-row :gutter="24" class="kpi-cards">
              <el-col :span="6">
                <div class="kpi-card personal-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <el-icon :size="32"><Document /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">{{ personalData.personalKpi.totalDocuments }}</div>
                    <div class="kpi-label">我的文书总数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="kpi-card personal-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <el-icon :size="32"><Clock /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">{{ personalData.personalKpi.savedHours }} <span class="kpi-unit">小时</span></div>
                    <div class="kpi-label">节省工时</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="kpi-card personal-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <el-icon :size="32"><MagicStick /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">{{ personalData.personalKpi.aiAdoptionRate }}%</div>
                    <div class="kpi-label">AI 采纳率</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="kpi-card personal-card ranking-card">
                  <div class="kpi-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                    <el-icon :size="32"><Trophy /></el-icon>
                  </div>
                  <div class="kpi-content">
                    <div class="kpi-value">Top {{ 100 - personalData.personalKpi.efficiencyRanking }}%</div>
                    <div class="kpi-label">效率排名</div>
                    <div class="ranking-badge">战胜了全校 {{ personalData.personalKpi.efficiencyRanking }}% 的用户 🎉</div>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 个人图表区域 -->
            <el-row :gutter="24" class="chart-section">
              <!-- 我的文书类型分布 -->
              <el-col :span="10">
                <div class="chart-card">
                  <h3 class="chart-title">我的文书类型分布</h3>
                  <v-chart :option="personalDocTypeOption" style="height: 300px;" autoresize />
                </div>
              </el-col>

              <!-- 个人时间趋势 -->
              <el-col :span="14">
                <div class="chart-card">
                  <h3 class="chart-title">我的创作趋势</h3>
                  <v-chart :option="personalTrendOption" style="height: 300px;" autoresize />
                </div>
              </el-col>
            </el-row>

            <!-- 常用模板和最近文书 -->
            <el-row :gutter="24" class="chart-section">
              <!-- 常用模板快捷入口 -->
              <el-col :span="12">
                <div class="chart-card">
                  <h3 class="chart-title">我的常用模板</h3>
                  <div class="favorite-templates">
                    <div v-for="template in personalData.favoriteTemplates" :key="template.id" class="template-item">
                      <div class="template-info">
                        <div class="template-name">{{ template.name }}</div>
                        <div class="template-meta">
                          <el-tag size="small" type="info">{{ template.category }}</el-tag>
                          <span class="use-count">使用 {{ template.useCount }} 次</span>
                          <span class="last-used">最近: {{ template.lastUsed }}</span>
                        </div>
                      </div>
                      <el-button type="primary" size="small" round>
                        <el-icon><Edit /></el-icon>
                        使用模板
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-col>

              <!-- 最近文书 -->
              <el-col :span="12">
                <div class="chart-card">
                  <h3 class="chart-title">最近文书</h3>
                  <el-table :data="personalData.recentDocuments" class="recent-table" stripe>
                    <el-table-column prop="title" label="文书名称" min-width="180" />
                    <el-table-column prop="type" label="类型" width="100" align="center">
                      <template #default="{ row }">
                        <el-tag size="small">{{ row.type }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="80" align="center">
                      <template #default="{ row }">
                        <el-tag :type="row.status === '已完成' ? 'success' : 'warning'" size="small">
                          {{ row.status }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="aiAdoption" label="AI采纳" width="80" align="center">
                      <template #default="{ row }">
                        <span :style="{ color: row.aiAdoption >= 80 ? '#67C23A' : '#E6A23C' }">
                          {{ row.aiAdoption }}%
                        </span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-col>
            </el-row>

            <!-- 成就系统 -->
            <el-row :gutter="24" class="chart-section">
              <el-col :span="24">
                <div class="chart-card">
                  <h3 class="chart-title">我的成就</h3>
                  <div class="achievements">
                    <div v-for="achievement in personalData.achievements" :key="achievement.title" 
                         class="achievement-item" :class="{ unlocked: achievement.unlocked }">
                      <div class="achievement-icon">
                        <el-icon :size="40">
                          <component :is="achievement.icon" />
                        </el-icon>
                      </div>
                      <div class="achievement-info">
                        <div class="achievement-title">{{ achievement.title }}</div>
                        <div class="achievement-desc">{{ achievement.description }}</div>
                        <div v-if="achievement.unlocked" class="achievement-date">
                          解锁于 {{ achievement.date }}
                        </div>
                      </div>
                      <div v-if="achievement.unlocked" class="achievement-badge">
                        <el-icon color="#FFD700"><CircleCheck /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import globalStatsData from '@/mock/statistics_data.json'
import personalStatsData from '@/mock/personal_stats.json'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const activeView = ref('global')
const globalData = ref(globalStatsData)
const personalData = ref(personalStatsData)

// 文书类型分布饼图配置
const documentTypeOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}份 ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: globalData.value.documentTypes.map(item => ({
        name: item.name,
        value: item.count
      })),
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
    }
  ]
}))

// 部门使用排行柱状图配置
const departmentRankingOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: globalData.value.departmentRanking.slice(0, 5).map(d => d.name),
    axisLabel: {
      interval: 0,
      rotate: 0
    }
  },
  yAxis: {
    type: 'value',
    name: '文书数量'
  },
  series: [
    {
      type: 'bar',
      data: globalData.value.departmentRanking.slice(0, 5).map(d => d.count),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#1890FF' },
            { offset: 1, color: '#096dd9' }
          ]
        },
        borderRadius: [8, 8, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      }
    }
  ]
}))

// 时间趋势折线图配置
const timeTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['本学期', '去年同期']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: globalData.value.timeTrend.map(t => t.month.substring(5))
  },
  yAxis: {
    type: 'value',
    name: '文书数量'
  },
  series: [
    {
      name: '本学期',
      type: 'line',
      data: globalData.value.timeTrend.map(t => t.count),
      smooth: true,
      itemStyle: { color: '#1890FF' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ]
        }
      }
    },
    {
      name: '去年同期',
      type: 'line',
      data: globalData.value.timeTrend.map(t => t.lastYear),
      smooth: true,
      itemStyle: { color: '#52C41A' },
      lineStyle: { type: 'dashed' }
    }
  ]
}))

// 个人文书类型分布饼图配置
const personalDocTypeOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}份 ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      },
      data: personalData.value.documentTypes.map(item => ({
        name: item.name,
        value: item.count
      })),
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
    }
  ]
}))

// 个人时间趋势折线图配置
const personalTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: personalData.value.timeTrend.map(t => t.month.substring(5))
  },
  yAxis: {
    type: 'value',
    name: '文书数量'
  },
  series: [
    {
      type: 'line',
      data: personalData.value.timeTrend.map(t => t.count),
      smooth: true,
      itemStyle: { color: '#722ED1' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(114, 46, 209, 0.3)' },
            { offset: 1, color: 'rgba(114, 46, 209, 0.05)' }
          ]
        }
      }
    }
  ]
}))
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 0;
}

.page-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
}

.view-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px 24px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* KPI 卡片样式 */
.kpi-cards {
  margin-bottom: 24px;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.kpi-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.kpi-unit {
  font-size: 16px;
  font-weight: normal;
  color: #909399;
}

.kpi-label {
  font-size: 14px;
  color: #606266;
}

.ranking-badge {
  margin-top: 8px;
  font-size: 12px;
  color: #67C23A;
  font-weight: 600;
}

/* 图表卡片样式 */
.chart-section {
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
  padding-left: 12px;
  border-left: 4px solid #1890FF;
}

/* 表格样式 */
.template-table,
.reference-table,
.recent-table {
  font-size: 14px;
}

.template-table :deep(.el-table__header th),
.reference-table :deep(.el-table__header th),
.recent-table :deep(.el-table__header th) {
  background: #fafafa;
  font-weight: 600;
  color: #303133;
}

/* 合规风险样式 */
.compliance-stats {
  padding: 10px 0;
}

.compliance-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.total-blocks {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 12px;
  color: white;
}

.total-blocks .number {
  display: block;
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 8px;
}

.total-blocks .label {
  font-size: 16px;
  opacity: 0.9;
}

.risk-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.risk-name {
  width: 120px;
  font-size: 14px;
  color: #606266;
}

.risk-bar {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.risk-progress {
  height: 100%;
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
  transition: width 0.3s ease;
}

.risk-count {
  width: 60px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 质量指标样式 */
.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 0;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890FF;
}

/* 常用模板样式 */
.favorite-templates {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.template-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.use-count,
.last-used {
  font-size: 12px;
}

/* 成就系统样式 */
.achievements {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.5;
}

.achievement-item.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
  border-color: #FFD700;
}

.achievement-item.unlocked:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
}

.achievement-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.achievement-item:not(.unlocked) .achievement-icon {
  background: #d9d9d9;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.achievement-date {
  font-size: 12px;
  color: #909399;
}

.achievement-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .kpi-value {
    font-size: 24px;
  }
  
  .achievements {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>
