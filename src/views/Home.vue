<template>
  <div class="min-h-screen flex items-center justify-center">
    Mengalihkan...
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.userRole === 'ADMIN') {
    router.replace('/admin')
  } else if (authStore.userRole === 'SUPIR') {
    router.replace('/supir')
  } else {
    router.replace('/pending')
  }
})
</script>