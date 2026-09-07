<template>
  <nav class="bg-white border-b-2 border-gray-900 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center font-black text-xl tracking-tight text-blue-600">
            SJFlow
          </div>
          <div class="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-4">
            <router-link
              to="/"
              class="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-3 pt-1 border-b-4 text-sm font-bold transition-colors"
              exact-active-class="!border-gray-900 !text-gray-900"
            >
              Surat Jalan
              <span v-if="activeTasks > 0" class="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-800">
                {{ activeTasks }} Aktif
              </span>
            </router-link>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- Mobile notification badge indicator -->
          <div class="sm:hidden flex items-center">
             <span v-if="activeTasks > 0" class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-800">
                {{ activeTasks }} Tugas
              </span>
          </div>
          <button @click="handleLogout" class="text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl border-2 border-transparent hover:border-gray-900 transition-all">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const activeTasks = ref(0)
let subscription = null

const fetchCounts = async () => {
  try {
    const { count, error } = await supabase
      .from('surat_jalan')
      .select('*', { count: 'exact', head: true })
      .in('status', ['DRAFT', 'MENUNGGU ADMIN', 'MENUNGGU SUPIR', 'DITERIMA SUPIR', 'DALAM PENGIRIMAN'])
      
    if (!error && count !== null) {
      activeTasks.value = count
    }
  } catch (err) {
    console.error('Error fetching count:', err)
  }
}

const setupRealtime = () => {
  subscription = supabase
    .channel('public:surat_jalan')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'surat_jalan' }, () => {
      fetchCounts()
    })
    .subscribe()
}

onMounted(() => {
  fetchCounts()
  setupRealtime()
})

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
})

const handleLogout = async () => {
  if (subscription) supabase.removeChannel(subscription)
  await authStore.signOut()
  router.push('/login')
}
</script>