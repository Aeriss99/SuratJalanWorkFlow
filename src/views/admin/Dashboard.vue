<template>
  <div class="min-h-screen bg-gray-50">
    <AdminNavbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Daftar Surat Jalan</h1>
        <router-link
          to="/admin/surat-jalan/create"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Buat Baru
        </router-link>
      </div>

      <!-- Tabs Navigasi Status -->
      <div class="px-4 sm:px-0 mt-2 mb-4">
        <div class="sm:hidden">
          <label for="tabs" class="sr-only">Pilih Tab</label>
          <select id="tabs" v-model="activeTab" class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white shadow-sm">
            <option v-for="tab in tabs" :key="tab.id" :value="tab.id">{{ tab.name }} ({{ getTabCount(tab.id) }})</option>
          </select>
        </div>
        <div class="hidden sm:block">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center'
                ]"
              >
                {{ tab.name }}
                <span 
                  :class="[
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600',
                    'ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium transition-colors'
                  ]"
                >
                  {{ getTabCount(tab.id) }}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="sj in filteredList" :key="sj.id">
              <router-link :to="`/admin/surat-jalan/${sj.id}`" class="block hover:bg-gray-50 transition-colors">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-blue-600 truncate">
                      {{ sj.nomor_dokumen }}
                    </p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                         :class="statusColor(sj.status)">
                        {{ sj.status }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        Customer: <span class="font-medium text-gray-700 ml-1">{{ sj.customer }}</span>
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Tgl: {{ sj.tanggal_pengiriman }}
                      </p>
                    </div>
                  </div>
                </div>
              </router-link>
            </li>
            
            <li v-if="filteredList.length === 0 && !loading" class="px-4 py-12 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
              <p class="mt-1 text-sm text-gray-500">
                Belum ada Surat Jalan di kategori ini.
              </p>
            </li>
            
            <li v-if="loading" class="px-4 py-12 text-center text-gray-500">
              <div class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-2">Memuat data...</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar.vue'

const suratJalanList = ref([])
const loading = ref(true)
const activeTab = ref('semua')

const tabs = [
  { id: 'semua', name: 'Semua' },
  { id: 'belum_selesai', name: 'Butuh Tindakan' },
  { id: 'diproses', name: 'Diproses Supir' },
  { id: 'selesai', name: 'Selesai' }
]

const fetchSuratJalan = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    suratJalanList.value = data
  } catch (err) {
    console.error(err)
    alert('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  if (activeTab.value === 'semua') return suratJalanList.value
  
  return suratJalanList.value.filter(sj => {
    switch (activeTab.value) {
      case 'belum_selesai':
        return ['DRAFT', 'MENUNGGU ADMIN'].includes(sj.status)
      case 'diproses':
        return ['MENUNGGU SUPIR', 'DITERIMA SUPIR', 'DALAM PENGIRIMAN'].includes(sj.status)
      case 'selesai':
        return sj.status === 'SELESAI'
      default:
        return true
    }
  })
})

const getTabCount = (tabId) => {
  if (tabId === 'semua') return suratJalanList.value.length
  
  return suratJalanList.value.filter(sj => {
    switch (tabId) {
      case 'belum_selesai':
        return ['DRAFT', 'MENUNGGU ADMIN'].includes(sj.status)
      case 'diproses':
        return ['MENUNGGU SUPIR', 'DITERIMA SUPIR', 'DALAM PENGIRIMAN'].includes(sj.status)
      case 'selesai':
        return sj.status === 'SELESAI'
      default:
        return true
    }
  }).length
}

const statusColor = (status) => {
  const colors = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'MENUNGGU ADMIN': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'MENUNGGU SUPIR': 'bg-orange-100 text-orange-800 border border-orange-200',
    'DITERIMA SUPIR': 'bg-blue-100 text-blue-800 border border-blue-200',
    'DALAM PENGIRIMAN': 'bg-purple-100 text-purple-800 border border-purple-200',
    'SELESAI': 'bg-green-100 text-green-800 border border-green-200',
    'DITOLAK': 'bg-red-100 text-red-800 border border-red-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchSuratJalan()
})
</script>