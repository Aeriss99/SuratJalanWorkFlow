<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
    <div class="max-w-[400px] w-full">
      <!-- Logo & Header -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex justify-center mb-4">
          <img src="/logo.png" alt="Logo" class="h-20 w-auto mix-blend-multiply" />
        </h1>
        <p class="mt-2 text-sm text-gray-500">
          Sistem Digital Surat Jalan & Serah Terima
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6 sm:p-8 animate-fade-in-up delay-100">
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Selamat Datang</h2>
          <p class="text-sm text-gray-500 mt-1 leading-relaxed">Gunakan akun Google Anda untuk masuk ke sistem.</p>
        </div>

        <button
          @click="handleLogin"
          :disabled="loading"
          class="relative w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-900 rounded-xl bg-white hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all duration-150 text-sm font-bold text-gray-800 shadow-neo focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!loading" class="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <Loader2 v-else class="w-5 h-5 text-gray-500 animate-spin" />
          {{ loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google' }}
        </button>
      </div>

      <!-- Footer Info -->
      <p class="text-center text-xs text-gray-400 mt-8 leading-relaxed">
        Hanya untuk pengguna internal perusahaan.<br>
        Akses baru akan memerlukan persetujuan.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const { showToast } = useToast()
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    await authStore.signInWithGoogle()
  } catch (error) {
    showToast(error.message || 'Gagal terhubung dengan Google.', 'error')
    loading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(12px);
}

.delay-100 {
  animation-delay: 100ms;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>