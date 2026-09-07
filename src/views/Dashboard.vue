<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center mt-2">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Daftar Surat Jalan</h1>
        <router-link
          to="/surat-jalan/create"
          class="inline-flex items-center px-4 py-2.5 border-2 border-gray-900 text-sm font-bold rounded-xl shadow-neo text-gray-900 bg-blue-400 hover:bg-blue-500 active:translate-y-0.5 active:shadow-none transition-all"
        >
          Buat Baru
        </router-link>
      </div>

            <!-- Quick Stats -->
      <div class="px-4 sm:px-0 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-yellow-800 uppercase">Review</p>
          <p class="text-2xl font-black text-yellow-900">{{ getTabCount('SUBMITTED') }}</p>
        </div>
        <div class="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-orange-800 uppercase">Menunggu Supir</p>
          <p class="text-2xl font-black text-orange-900">{{ getTabCount('ASSIGNED') }}</p>
        </div>
        <div class="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-purple-800 uppercase">Dalam Perjalanan</p>
          <p class="text-2xl font-black text-purple-900">{{ getTabCount('ON_DELIVERY') }}</p>
        </div>
        <div class="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-blue-800 uppercase">Selesai</p>
          <p class="text-2xl font-black text-blue-900">{{ getTabCount('COMPLETED') }}</p>
        </div>
      </div>

      <!-- Tabs Navigasi Status -->
      <div class="px-4 sm:px-0 mt-2 mb-6">
        <div class="sm:hidden">
          <label for="tabs" class="sr-only">Pilih Tab</label>
          <div class="relative">
            <select id="tabs" v-model="activeTab" class="block w-full rounded-xl border-2 border-gray-900 py-3 pl-4 pr-10 text-base font-bold focus:border-blue-500 focus:outline-none sm:text-sm bg-white shadow-neo appearance-none">
              <option v-for="tab in tabs" :key="tab.id" :value="tab.id">{{ tab.name }} ({{ getTabCount(tab.id) }})</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-900">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
        <div class="hidden sm:block">
          <nav class="flex space-x-2 overflow-x-auto pb-2" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-neo translate-y-[-2px]'
                  : 'bg-white text-gray-600 border-2 border-gray-900 hover:bg-gray-50',
                'px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center'
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
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <!-- Surat Jalan List -->
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
                      {{ getStatusLabel(sj.status) }}
                    </p>
                  </div>
                </div>
                <div class="sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm font-medium text-gray-600">
                      Customer: <span class="font-bold text-gray-900 ml-1">{{ sj.customer }}</span>
                    </p>
                    <p class="flex items-center text-sm font-medium text-gray-600 sm:ml-4" v-if="sj.supir_id">
                      Supir: <span class="font-bold text-gray-900 ml-1">{{ getSupirName(sj.supir_id) }}</span>
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
            <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 class="mt-2 text-base font-bold text-gray-900">Tidak ada data</h3>
            <p class="mt-1 text-sm font-medium text-gray-500">
              Belum ada Surat Jalan di kategori ini.
            </p>
          </div>
        </div>

        <div v-if="loading" class="px-4 py-12 text-center text-gray-500 font-bold">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p>Memuat data...</p>
          </div>
        </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { getStatusLabel, statusColor } from '@/utils/status'
import Navbar from '@/components/Navbar.vue'

const suratJalanList = ref([])
const loading = ref(true)
const activeTab = ref('semua')

const tabs = [
  { id: 'semua', name: 'Semua' },
  { id: 'DRAFT', name: 'Draft' },
  { id: 'SUBMITTED', name: 'Menunggu Review' },
  { id: 'APPROVED', name: 'Disetujui' },
  { id: 'ASSIGNED', name: 'Menunggu Supir' },
  { id: 'ACCEPTED', name: 'Diterima Supir' },
  { id: 'ON_DELIVERY', name: 'Dalam Pengiriman' },
  { id: 'DELIVERED', name: 'Terkirim' },
  { id: 'COMPLETED', name: 'Selesai' },
  { id: 'REJECTED', name: 'Ditolak' },
  { id: 'CANCELLED', name: 'Dibatalkan' }
]


import { useToast } from '@/composables/useToast'

const users = ref([])
const { showToast } = useToast()

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nomor_dokumen, status, customer, tanggal_pengiriman, supir_id')
      .limit(200)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    users.value = data
  } catch (err) {
    console.error(err)
  }
}



const getSupirName = (supirId) => {
  const user = users.value.find(u => u.id === supirId)
  return user ? (user.name || user.email) : 'Menunggu'
}

onMounted(() => {
  fetchSuratJalan()
  fetchUsers()
})

const fetchSuratJalan = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('id, nomor_dokumen, status, customer, tanggal_pengiriman, supir_id')
      .limit(200)
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
  return suratJalanList.value.filter(sj => sj.status === activeTab.value)
})

const getTabCount = (tabId) => {
  if (tabId === 'semua') return suratJalanList.value.length
  return suratJalanList.value.filter(sj => sj.status === tabId).length
}



</script>