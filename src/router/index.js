import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/pending',
      name: 'pending',
      component: () => import('../views/Pending.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/surat-jalan/create',
      name: 'sj-create',
      component: () => import('../views/SuratJalanCreate.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/surat-jalan/:id',
      name: 'sj-detail',
      component: () => import('../views/SuratJalanDetail.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  const isAuthenticated = !!authStore.user
  const userRole = authStore.userRole

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return next('/')
  }

  if (isAuthenticated && userRole === 'PENDING' && to.path !== '/pending' && to.path !== '/login') {
    return next('/pending')
  }

  if (isAuthenticated && userRole !== 'PENDING' && to.path === '/pending') {
    return next('/')
  }

  next()
})

export default router
