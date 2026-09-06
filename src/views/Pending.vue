<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div class="rounded-full bg-yellow-100 p-4 mx-auto w-16 h-16 flex items-center justify-center">
        <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Menunggu Persetujuan
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Akun Anda sedang menunggu persetujuan dari Administrator. Silakan hubungi Admin jika butuh bantuan segera.
        </p>
      </div>
      <div class="mt-8">
        <button
          @click="authStore.signOut()"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>