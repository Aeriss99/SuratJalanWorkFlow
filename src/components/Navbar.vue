<template>
  <div>
    <!-- Top Navbar -->
    <nav class="bg-white border-b-2 border-gray-900 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Mobile Hamburger Button -->
            <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="sm:hidden mr-4 text-gray-900 focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 6h16M4 12h16M4 18h16"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div class="flex-shrink-0 flex items-center font-black text-xl tracking-tight text-blue-600">
              SJFlow
            </div>
            
            <!-- Desktop Links -->
            <div class="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-4">
              <router-link to="/" class="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-3 pt-1 border-b-4 text-sm font-bold transition-colors" exact-active-class="!border-gray-900 !text-gray-900">
                Dashboard
              </router-link>
              <router-link to="/surat-jalan/create" class="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-3 pt-1 border-b-4 text-sm font-bold transition-colors" active-class="!border-gray-900 !text-gray-900">
                Buat Baru
              </router-link>
              <router-link to="/pengiriman-saya" class="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-3 pt-1 border-b-4 text-sm font-bold transition-colors" active-class="!border-gray-900 !text-gray-900">
                Pengiriman Saya
              </router-link>
            </div>
          </div>
          <div class="hidden sm:flex items-center gap-4">
            <button @click="handleLogout" class="text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl border-2 border-transparent hover:border-gray-900 transition-all">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Drawer / Dropdown -->
    <div v-if="isMobileMenuOpen" class="sm:hidden fixed inset-0 z-30 flex">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50" @click="isMobileMenuOpen = false"></div>
      
      <!-- Drawer Content -->
      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r-2 border-gray-900 h-full pt-16 pb-4">
        <div class="flex-1 h-0 overflow-y-auto px-4 py-6 space-y-4">
          <router-link to="/" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-xl border-2 border-transparent font-bold text-gray-700 hover:bg-gray-100 active:border-gray-900 transition-all" exact-active-class="bg-blue-50 text-blue-800 border-blue-800">
            Dashboard
          </router-link>
          <router-link to="/surat-jalan/create" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-xl border-2 border-transparent font-bold text-gray-700 hover:bg-gray-100 active:border-gray-900 transition-all" active-class="bg-blue-50 text-blue-800 border-blue-800">
            Buat Surat Jalan
          </router-link>
          <router-link to="/pengiriman-saya" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-xl border-2 border-transparent font-bold text-gray-700 hover:bg-gray-100 active:border-gray-900 transition-all" active-class="bg-blue-50 text-blue-800 border-blue-800">
            Pengiriman Saya
          </router-link>
        </div>
        <div class="px-4 border-t-2 border-gray-100 pt-4">
          <button @click="handleLogout" class="w-full text-left px-4 py-3 font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

const handleLogout = async () => {
  isMobileMenuOpen.value = false
  await authStore.signOut()
  router.push('/login')
}
</script>
