<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
            SJFlow Admin
          </div>
          <div class="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              to="/admin"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              exact-active-class="!border-blue-500 !text-gray-900"
            >
              Surat Jalan
            </router-link>
            <router-link
              to="/admin/users"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="!border-blue-500 !text-gray-900"
            >
              Kelola User
            </router-link>
          </div>
        </div>
        <div class="flex items-center">
          <button @click="handleLogout" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>