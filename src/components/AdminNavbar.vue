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
              <span v-if="activeTasks > 0" class="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {{ activeTasks }} Aktif
              </span>
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
        <div class="flex items-center gap-4">
          <!-- Mobile notification badge indicator -->
          <div class="sm:hidden flex items-center">
             <span v-if="activeTasks > 0" class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {{ activeTasks }} Tugas
              </span>
          </div>
          <button @click="handleLogout" class="text-sm font-medium text-gray-500 hover:text-gray-700">
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