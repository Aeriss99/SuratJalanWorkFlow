<template>
  <div>
    <!-- Top Bar -->
    <header class="bg-blue-600 text-white shadow-md fixed top-0 w-full z-10">
      <div class="px-4 py-3 flex justify-between items-center">
        <h1 class="text-lg font-semibold">{{ title }}</h1>
        <button @click="handleLogout" class="text-sm bg-blue-700 px-3 py-1 rounded">Logout</button>
      </div>
    </header>
    
    <!-- Main Content Padding -->
    <div class="pt-14 pb-20 min-h-screen bg-gray-100">
      <slot></slot>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bg-white border-t border-gray-200 fixed bottom-0 w-full pb-safe z-10 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <router-link to="/supir" class="flex flex-col items-center justify-center w-full h-full text-gray-500" exact-active-class="text-blue-600">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span class="text-xs font-medium">Tugas</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  title: {
    type: String,
    default: 'SJFlow Driver'
  }
})

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>