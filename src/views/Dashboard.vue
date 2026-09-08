<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2 mb-6">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Riwayat Pengiriman (Selesai)</h1>
        <div class="flex gap-2 w-full sm:w-auto">
          <input type="text" v-model="searchQuery" placeholder="Cari No. SJ / Customer..." class="block w-full sm:w-64 px-4 py-2.5 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 text-sm font-bold shadow-sm" />
          <router-link to="/surat-jalan/create" class="hidden sm:inline-flex items-center px-4 py-2.5 border-2 border-gray-900 text-sm font-bold rounded-xl shadow-neo text-gray-900 bg-blue-400 hover:bg-blue-500 active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap">
            Buat Baru
          </router-link>
        </div>
      </div>

      <div class="px-4 sm:px-0">
        <!-- Surat Jalan List -->
        <div class="space-y-4">
          <div v-for="sj in filteredList" :key="sj.id" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 overflow-hidden hover:translate-y-[-2px] hover:shadow-neo-strong transition-all">
            <router-link :to="`/surat-jalan/${sj.id}`" class="block">
              <div class="p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-base sm:text-lg font-black text-gray-900 truncate">{{ sj.nomor_dokumen }}</p>
                    <span class="sm:hidden px-2 py-0.5 text-[10px] font-bold rounded-full border-2" :class="statusColor(sj.status)">
                      {{ getStatusLabel(sj.status) }}
                    </span>
                  </div>
                  <p class="text-sm font-medium text-gray-600 line-clamp-1">
                    <span class="font-bold text-gray-900">{{ sj.customer }}</span>
                  </p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-medium text-gray-500">
                    <p>Tgl: <span class="font-bold text-gray-800">{{ sj.tanggal_pengiriman }}</span></p>
                  </div>
                </div>
                <div class="hidden sm:flex flex-shrink-0 items-center">
                  <span class="px-3 py-1 text-xs font-bold rounded-full border-2" :class="statusColor(sj.status)">
                    {{ getStatusLabel(sj.status) }}
                  </span>
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
              Belum ada riwayat Surat Jalan selesai.
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
const searchQuery = ref('')

onMounted(() => {
  fetchSuratJalan()
})

const fetchSuratJalan = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('id, nomor_dokumen, status, customer, tanggal_pengiriman, supir_id, created_at')
      .in('status', ['COMPLETED', 'DELIVERED'])
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
  let list = suratJalanList.value
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(sj => sj.nomor_dokumen.toLowerCase().includes(q) || sj.customer.toLowerCase().includes(q))
  } else {
    // Filter 30 hari untuk status Selesai jika tidak ada pencarian
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    list = list.filter(sj => new Date(sj.created_at) >= thirtyDaysAgo)
  }
  
  return list
})
</script>
