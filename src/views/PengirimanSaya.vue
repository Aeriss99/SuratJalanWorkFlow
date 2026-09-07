<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Pengiriman Saya</h1>
        <p class="text-sm font-bold text-gray-500 mt-1">Daftar Surat Jalan yang ditugaskan kepada Anda.</p>
      </div>

      <div class="mt-4 px-4 sm:px-0 mb-6">
        <nav class="flex space-x-2 overflow-x-auto pb-2" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-neo translate-y-[-2px]'
                : 'bg-white text-gray-600 border-2 border-gray-900 hover:bg-gray-50',
              'px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center whitespace-nowrap'
            ]"
          >
            {{ tab.name }}
            <span 
              :class="[
                activeTab === tab.id ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-900 border border-gray-900',
                'ml-2 rounded-full py-0.5 px-2.5 text-xs font-bold transition-colors'
              ]"
            >
              {{ getTabCount(tab.id) }}
            </span>
          </button>
        </nav>
      </div>

      <div class="px-4 sm:px-0">
        <div class="space-y-4">
          <div v-for="sj in filteredList" :key="sj.id" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 overflow-hidden hover:translate-y-[-2px] hover:shadow-neo-strong transition-all">
            <router-link :to="`/surat-jalan/${sj.id}`" class="block">
              <div class="px-5 py-5 sm:px-6">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-lg font-black text-gray-900 truncate">
                    {{ sj.nomor_dokumen }}
                  </p>
                  <div class="ml-2 flex-shrink-0 flex">
                    <p class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2"
                       :class="statusColor(sj.status)">
                      {{ sj.status }}
                    </p>
                  </div>
                </div>
                <div class="sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm font-medium text-gray-600">
                      Tujuan: <span class="font-bold text-gray-900 ml-1">{{ sj.customer }}</span>
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm font-medium text-gray-500 sm:mt-0">
                    <p>
                      Tgl: <span class="font-bold text-gray-900">{{ sj.tanggal_pengiriman }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
          
          <div v-if="filteredList.length === 0 && !loading" class="px-4 py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 class="mt-2 text-base font-bold text-gray-900">Tidak ada tugas</h3>
            <p class="mt-1 text-sm font-medium text-gray-500">
              Belum ada pengiriman di kategori ini.
            </p>
          </div>
        </div>

        <div v-if="loading" class="px-4 py-12 text-center text-gray-500 font-bold">
          <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const myTasks = ref([])
const loading = ref(true)
const activeTab = ref('aktif')

const tabs = [
  { id: 'tugas_baru', name: 'Menunggu Diterima', statuses: ['MENUNGGU SUPIR'] },
  { id: 'aktif', name: 'Sedang Berjalan', statuses: ['DITERIMA SUPIR', 'DALAM PENGIRIMAN'] },
  { id: 'selesai', name: 'Riwayat Selesai', statuses: ['TERKIRIM', 'SELESAI'] }
]

const fetchMyTasks = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('id, nomor_dokumen, status, customer, tanggal_pengiriman, supir_id')
      .limit(100)
      .eq('supir_id', authStore.user.id)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    myTasks.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const getTabCount = (tabId) => {
  const tab = tabs.find(t => t.id === tabId)
  if (!tab) return 0
  return myTasks.value.filter(sj => tab.statuses.includes(sj.status)).length
}

const filteredList = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value)
  if (!tab) return myTasks.value
  return myTasks.value.filter(sj => tab.statuses.includes(sj.status))
})

const statusColor = (status) => {
  const colors = {
    'DRAFT': 'bg-gray-100 text-gray-800 border-gray-900',
    'MENUNGGU REVIEW': 'bg-yellow-100 text-yellow-900 border-yellow-900',
    'DISETUJUI': 'bg-green-100 text-green-900 border-green-900',
    'MENUNGGU SUPIR': 'bg-orange-100 text-orange-900 border-orange-900',
    'DITERIMA SUPIR': 'bg-indigo-100 text-indigo-900 border-indigo-900',
    'DALAM PENGIRIMAN': 'bg-purple-100 text-purple-900 border-purple-900',
    'TERKIRIM': 'bg-teal-100 text-teal-900 border-teal-900',
    'SELESAI': 'bg-blue-100 text-blue-900 border-blue-900',
    'DITOLAK': 'bg-red-100 text-red-900 border-red-900',
    'DIBATALKAN': 'bg-gray-300 text-gray-900 border-gray-900'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-900'
}

onMounted(() => {
  fetchMyTasks()
})
</script>
