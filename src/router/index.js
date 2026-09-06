import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/Dashboard.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/Users.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/admin/surat-jalan/create',
      name: 'admin-sj-create',
      component: () => import('../views/admin/SuratJalanCreate.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/admin/surat-jalan/:id',
      name: 'admin-sj-detail',
      component: () => import('../views/admin/SuratJalanDetail.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/supir',
      name: 'supir-dashboard',
      component: () => import('../views/supir/Dashboard.vue'),
      meta: { requiresAuth: true, role: 'SUPIR' }
    },
    {
      path: '/supir/surat-jalan/:id',
      name: 'supir-sj-detail',
      component: () => import('../views/supir/SuratJalanDetail.vue'),
      meta: { requiresAuth: true, role: 'SUPIR' }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for initial auth check if not done
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

  if (isAuthenticated && to.path === '/') {
    if (userRole === 'ADMIN') return next('/admin')
    if (userRole === 'SUPIR') return next('/supir')
    return next('/pending')
  }

  if (to.meta.role && to.meta.role !== userRole) {
    if (userRole === 'PENDING') return next('/pending')
    if (userRole === 'ADMIN') return next('/admin')
    if (userRole === 'SUPIR') return next('/supir')
    return next('/')
  }

  next()
})

export default router