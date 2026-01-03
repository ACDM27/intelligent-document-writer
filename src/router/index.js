import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import SmartWriter from '@/views/SmartWriter.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { title: '登录', requiresAuth: false }
    },
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '工作台', requiresAuth: true }
    },
    {
        path: '/writer',
        name: 'SmartWriter',
        component: SmartWriter,
        meta: { title: '智能创作台', requiresAuth: true }
    },
    {
        path: '/templates',
        name: 'Templates',
        component: () => import('@/views/TemplateCenter.vue'),
        meta: { title: '模板中心', requiresAuth: true }
    },
    {
        path: '/templates/:id',
        name: 'TemplatePreview',
        component: () => import('@/views/TemplatePreview.vue'),
        meta: { title: '模板预览', requiresAuth: true }
    },
    {
        path: '/knowledge',
        name: 'Knowledge',
        component: () => import('@/views/KnowledgeBase.vue'),
        meta: { title: '知识库', requiresAuth: true }
    },
    {
        path: '/kb-chat',
        name: 'KBChat',
        component: () => import('@/views/KBChat.vue'),
        meta: { title: '知识库问答', requiresAuth: true }
    },
    {
        path: '/review',
        name: 'Review',
        component: () => import('@/views/ReviewCollaboration.vue'),
        meta: { title: '审阅协作', requiresAuth: true }
    },
    {
        path: '/review/:id',
        name: 'ReviewDetail',
        component: () => import('@/views/ReviewDetail.vue'),
        meta: { title: '审阅详情', requiresAuth: true }
    },
    {
        path: '/archive',
        name: 'Archive',
        component: () => import('@/views/Archive.vue'),
        meta: { title: '归档检索', requiresAuth: true }
    },
    {
        path: '/history',
        name: 'History',
        component: () => import('@/views/History.vue'),
        meta: { title: '历史记录', requiresAuth: true }
    },
    {
        path: '/analytics',
        name: 'Analytics',
        component: () => import('@/views/Statistics.vue'),
        meta: { title: '数据统计', requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫 - 登录验证
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = `${to.meta.title || ''} - 智能文书生成系统`

    // 检查是否需要登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (to.meta.requiresAuth && !isLoggedIn) {
        // 需要登录但未登录，跳转到登录页
        next('/login')
    } else if (to.path === '/login' && isLoggedIn) {
        // 已登录用户访问登录页，跳转到工作台
        next('/')
    } else {
        next()
    }
})

export default router
