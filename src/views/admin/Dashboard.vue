<template>
  <div class="min-h-screen bg-gray-50">
    <AdminNavbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Daftar Surat Jalan</h1>
        <router-link
          to="/admin/surat-jalan/create"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Buat Baru
        </router-link>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="sj in suratJalanList" :key="sj.id">
              <router-link :to="`/admin/surat-jalan/${sj.id}`" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-blue-600 truncate">
                      {{ sj.nomor_dokumen }}
                    </p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                         :class="statusColor(sj.status)">
                        {{ sj.status }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        Customer: {{ sj.customer }}
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
            <li v-if="suratJalanList.length === 0 && !loading" class="px-4 py-8 text-center text-gray-500">
              Belum ada data Surat Jalan
            </li>
            <li v-if="loading" class="px-4 py-8 text-center text-gray-500">
              Memuat data...
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar.vue'

const suratJalanList = ref([])
const loading = ref(true)

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

const statusColor = (status) => {
  const colors = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'MENUNGGU ADMIN': 'bg-yellow-100 text-yellow-800',
    'MENUNGGU SUPIR': 'bg-orange-100 text-orange-800',
    'DITERIMA SUPIR': 'bg-blue-100 text-blue-800',
    'DALAM PENGIRIMAN': 'bg-purple-100 text-purple-800',
    'SELESAI': 'bg-green-100 text-green-800',
    'DITOLAK': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchSuratJalan()
})
</script>