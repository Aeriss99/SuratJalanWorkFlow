<template>
  <div v-if="!authStore.isInitialized" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
  <router-view v-else></router-view>
  <Toast />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Toast from '@/components/Toast.vue'

const authStore = useAuthStore()
</script>