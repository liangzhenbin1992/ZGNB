import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true'
  const hasToken = localStorage.getItem('access_token')
  
  if (to.meta.requiresAuth) {
    // 需要认证的页面
    if (isAuthenticated && hasToken) {
      next()
    } else {
      // 未认证，跳转到登录页
      next('/login')
    }
  } else {
    // 不需要认证的页面（如登录页）
    if (to.path === '/login' && isAuthenticated && hasToken) {
      // 已经认证，跳转到主页
      next('/')
    } else {
      next()
    }
  }
})

export default router 