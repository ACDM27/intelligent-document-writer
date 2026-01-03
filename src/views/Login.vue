<template>
  <div class="login-page">
    <!-- 左侧背景区域 -->
    <div class="login-left">
      <div class="brand-section">
        <div class="brand-logo">
          <el-icon :size="60" color="#1890FF"><Document /></el-icon>
        </div>
        <h1 class="brand-title">智能文书生成系统</h1>
        <p class="brand-subtitle">广西警察学院 · 合规优先 · 结构化生成</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <el-icon color="#1890FF"><CircleCheck /></el-icon>
            <span>四段式生成引擎</span>
          </div>
          <div class="feature-item">
            <el-icon color="#1890FF"><CircleCheck /></el-icon>
            <span>知识库智能检索</span>
          </div>
          <div class="feature-item">
            <el-icon color="#1890FF"><CircleCheck /></el-icon>
            <span>流程审批管理</span>
          </div>
          <div class="feature-item">
            <el-icon color="#1890FF"><CircleCheck /></el-icon>
            <span>标准红头套打</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-right">
      <div class="login-container">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>请使用您的账号密码登录系统</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入工号/账号"
              prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码?</el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>


        </el-form>

        <div class="login-footer">
          <el-divider>其他登录方式</el-divider>
          <div class="social-login">
            <el-tooltip content="统一认证登录" placement="top">
              <el-button circle>
                <el-icon><Key /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="扫码登录" placement="top">
              <el-button circle>
                <el-icon><Cellphone /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <div class="copyright">
          <p>© 2026 广西警察学院. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入工号/账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, message: '密码长度不能少于 5 位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        // 验证账号密码
        if (loginForm.username === 'admin' && loginForm.password === 'admin') {
          loading.value = false
          
          // 保存登录状态
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('username', loginForm.username)
          
          ElMessage.success('登录成功！')
          
          // 跳转到工作台
          router.push('/')
        } else {
          loading.value = false
          ElMessage.error('账号或密码错误！')
        }
      }, 1500)
    } else {
      ElMessage.error('请检查输入信息')
      return false
    }
  })
}
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 左侧背景区 */
.login-left {
  flex: 1;
  background-image: url('/20260104-033405.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}



.brand-section {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #1890FF;
  padding: 40px;
}

.brand-logo {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.brand-title {
  font-size: 42px;
  font-weight: bold;
  margin: 0 0 15px;
  color: #1890FF;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.5);
}

.brand-subtitle {
  font-size: 16px;
  margin-bottom: 50px;
  color: #1890FF;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #1890FF;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

/* 右侧登录表单 */
.login-right {
  width: 500px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

.login-container {
  width: 100%;
  max-width: 380px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 28px;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.login-header p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.login-form {
  margin-top: 30px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
}

.login-footer {
  margin-top: 30px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.social-login .el-button {
  width: 45px;
  height: 45px;
  font-size: 20px;
}

.copyright {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.copyright p {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
  }
}
</style>
