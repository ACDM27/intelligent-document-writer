<template>
  <div class="app-layout">
    <!-- 左侧全局导航栏 -->
    <aside class="global-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <el-icon :size="24" color="#1890FF"><Document /></el-icon>
          <span class="logo-text">智能文书生成系统</span>
        </div>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>工作台</span>
        </el-menu-item>

        <el-divider style="margin: 8px 0;" />

        <!-- 核心平台功能 -->
        <div class="menu-group-title">核心功能</div>

        <el-menu-item index="/writer">
          <el-icon><Edit /></el-icon>
          <span>智能创作</span>
        </el-menu-item>

        <el-menu-item index="/templates">
          <el-icon><Document /></el-icon>
          <span>模板中心</span>
        </el-menu-item>

        <el-menu-item index="/knowledge">
          <el-icon><FolderOpened /></el-icon>
          <span>知识库</span>
        </el-menu-item>

        <el-menu-item index="/review">
          <el-icon><EditPen /></el-icon>
          <span>审阅协作</span>
        </el-menu-item>

        <el-menu-item index="/archive">
          <el-icon><Box /></el-icon>
          <span>归档检索</span>
        </el-menu-item>

        <el-divider style="margin: 8px 0;" />

        <!-- 辅助功能 -->
        <div class="menu-group-title">辅助工具</div>

        <el-menu-item index="/history">
          <el-icon><Clock /></el-icon>
          <span>历史记录</span>
        </el-menu-item>

        <el-menu-item index="/analytics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
      </el-menu>

      <!-- 用户信息 -->
      <div class="sidebar-footer">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="username">{{ username }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)
const username = ref(localStorage.getItem('username') || '用户')

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 清除登录状态
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('username')
      
      ElMessage.success('已退出登录')
      
      // 跳转到登录页
      router.push('/login')
    }).catch(() => {
      // 取消退出
    })
  } else if (command === 'profile') {
    ElMessage.info('个人设置功能开发中')
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 全局侧边栏 */
.global-sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-text {
  font-size: 14px;
  font-weight: bold;
  color: #1890FF;
  white-space: nowrap;
}

/* 菜单样式 */
.sidebar-menu {
  flex: 1;
  border-right: none;
  padding: 10px 0;
  overflow-y: auto;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar-menu .el-menu-item:hover {
  background: #f0f5ff;
  color: #1890FF;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, #e6f4ff 0%, #bae0ff 100%);
  color: #1890FF;
  font-weight: 600;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 8px;
}

/* 菜单分组标题 */
.menu-group-title {
  padding: 12px 16px 8px;
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 底部用户信息 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f5f5;
}

.username {
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 主内容区 */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-color);
}

/* 滚动条美化 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>
