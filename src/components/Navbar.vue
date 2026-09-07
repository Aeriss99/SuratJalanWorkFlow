<template>
  <div>
    <!-- Top Navbar (Desktop & Mobile Header) -->
    <nav class="bg-white border-b-2 border-gray-900 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center font-black text-xl tracking-tight text-blue-600">
              SJFlow
            </div>
            <!-- Desktop Links -->
            <div class="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-4">
              <router-link
                to="/"
                class="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-3 pt-1 border-b-4 text-sm font-bold transition-colors"
                exact-active-class="!border-gray-900 !text-gray-900"
              >
                Dashboard
              </router-link>
              <router-link
                to="/pengiriman-saya"
                class="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-3 pt-1 border-b-4 text-sm font-bold transition-colors"
                active-class="!border-gray-900 !text-gray-900"
              >
                Pengiriman Saya
              </router-link>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button @click="handleLogout" class="text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl border-2 border-transparent hover:border-gray-900 transition-all">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation (Mobile Only) -->
    <div class="sm:hidden fixed bottom-0 w-full bg-white border-t-2 border-gray-900 z-50 pb-safe">
      <div class="flex justify-around items-center h-16">
        <router-link to="/" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 transition-colors" exact-active-class="text-blue-600 font-black">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span class="text-[10px] font-bold">Beranda</span>
        </router-link>
        
        <router-link to="/surat-jalan/create" class="flex flex-col items-center justify-center w-full h-full relative -top-3">
          <div class="bg-blue-600 text-white p-3 rounded-full shadow-neo border-2 border-gray-900 active:translate-y-0.5 active:shadow-none transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
          </div>
        </router-link>

        <router-link to="/pengiriman-saya" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 transition-colors" active-class="text-blue-600 font-black">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
          <span class="text-[10px] font-bold">Tugas Saya</span>
        </router-link>
      </div>
    </div>
  </div>
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

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
