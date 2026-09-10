<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Daftar Surat Jalan</h1>
        <div class="flex gap-2 w-full sm:w-auto">
          <input type="text" v-model="searchQuery" placeholder="Cari No. SJ / Customer..." class="block w-full sm:w-64 px-4 py-2.5 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 text-sm font-bold shadow-sm" />
          <button v-if="selectedSj.length > 0" @click="sendToGoogleSheets" :disabled="isSendingToSheets" class="hidden sm:inline-flex items-center px-4 py-2.5 border-2 border-gray-900 text-sm font-bold rounded-xl shadow-neo text-green-900 bg-green-400 hover:bg-green-500 active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap disabled:opacity-50">
            {{ isSendingToSheets ? 'Mengirim...' : 'Kirim ke Google Sheets (' + selectedSj.length + ')' }}
          </button>
          <router-link to="/surat-jalan/create" class="hidden sm:inline-flex items-center px-4 py-2.5 border-2 border-gray-900 text-sm font-bold rounded-xl shadow-neo text-gray-900 bg-blue-400 hover:bg-blue-500 active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap">
            Buat Baru
          </router-link>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="px-4 sm:px-0 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-gray-100 border-2 border-gray-300 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-gray-600 uppercase">Semua Aktif</p>
          <p class="text-2xl font-black text-gray-900">{{ getTabCount('semua') }}</p>
        </div>
        <div class="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-orange-800 uppercase">Draft & Batal</p>
          <p class="text-2xl font-black text-orange-900">{{ getTabCount('draft') }}</p>
        </div>
        <div class="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-purple-800 uppercase">Sedang Berjalan</p>
          <p class="text-2xl font-black text-purple-900">{{ getTabCount('berjalan') }}</p>
        </div>
        <div class="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-bold text-blue-800 uppercase">Selesai</p>
          <p class="text-2xl font-black text-blue-900">{{ getTabCount('selesai') }}</p>
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
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <!-- Surat Jalan List -->
        <div v-if="filteredList.length > 0" class="mb-4 flex items-center gap-2 bg-white p-3 rounded-xl border-2 border-gray-200">
          <input type="checkbox" @change="toggleSelectAll" :checked="selectedSj.length === filteredList.length" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm font-bold text-gray-700">Pilih Semua ({{ filteredList.length }})</span>
          
          <button v-if="selectedSj.length > 0" @click="sendToGoogleSheets" :disabled="isSendingToSheets" class="sm:hidden ml-auto items-center px-3 py-1.5 border-2 border-gray-900 text-xs font-bold rounded-xl shadow-neo text-green-900 bg-green-400 hover:bg-green-500 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            {{ isSendingToSheets ? 'Mengirim...' : 'Kirim ke Sheets' }}
          </button>
        </div>
        
        <div class="space-y-4">
          <div v-for="sj in filteredList" :key="sj.id" class="flex flex-row items-stretch gap-2">
            <div class="flex items-center pl-2">
              <input type="checkbox" v-model="selectedSj" :value="sj.id" class="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500" />
            </div>
            <div class="flex-1 bg-white rounded-2xl shadow-neo border-2 border-gray-900 overflow-hidden hover:translate-y-[-2px] hover:shadow-neo-strong transition-all">
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
    
      <!-- Modal Export Google Sheets -->
      <Teleport to="body">
        <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div class="bg-white border-4 border-gray-900 shadow-neo rounded-2xl p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
            
            <!-- Loading State -->
            <div v-if="isCreatingSheet" class="text-center py-6">
              <div class="animate-spin inline-block w-12 h-12 border-4 border-gray-900 border-t-blue-500 rounded-full mb-4"></div>
              <h3 class="text-xl font-black text-gray-900">Membuat Spreadsheet...</h3>
              <p class="text-sm font-bold text-gray-500 mt-2">Menyiapkan data Anda di Google Drive, mohon tunggu sebentar.</p>
            </div>

            <!-- Success State -->
            <div v-else>
              <h3 class="text-2xl font-black text-green-600 mb-2">✅ Pengiriman Berhasil!</h3>
              <p class="text-sm font-bold text-gray-600 mb-6">{{ selectedSj.length }} Surat Jalan telah sukses masuk ke Google Sheets.</p>
              
              <div class="mb-6">
                <label class="block text-sm font-bold text-gray-900 mb-2">Tautan Spreadsheet Baru:</label>
                <div class="flex gap-2">
                  <input type="text" readonly :value="generatedSheetUrl" class="w-full border-2 border-gray-900 rounded-xl p-3 font-medium bg-gray-50 text-gray-600 outline-none" />
                  <button @click="copyToClipboard" class="px-4 py-3 border-2 border-gray-900 rounded-xl font-black shadow-neo active:translate-y-0.5 active:shadow-none transition-all bg-yellow-300 hover:bg-yellow-400 text-gray-900 whitespace-nowrap">
                    {{ copySuccessMessage ? 'Disalin!' : 'Salin' }}
                  </button>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3">
                <button @click="closeModal" class="flex-1 px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-bold hover:bg-gray-100 transition-colors">
                  Tutup
                </button>
                <a :href="generatedSheetUrl" target="_blank" class="flex-1 px-4 py-3 border-2 border-gray-900 rounded-xl font-black shadow-neo active:translate-y-0.5 active:shadow-none transition-all bg-blue-400 hover:bg-blue-500 text-gray-900 text-center">
                  Buka Tab Baru
                </a>
              </div>
            </div>

          </div>
        </div>
      </Teleport>

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
const searchQuery = ref('')

const selectedSj = ref([])
const isSendingToSheets = ref(false)
const showSuccessModal = ref(false)
const isCreatingSheet = ref(false)
const generatedSheetUrl = ref('')
const copySuccessMessage = ref(false)

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8XzCqaai5DI7SIEHmjrNsPs6hgDXkE__pYABXzJhOKgWEpft58ubExGsBxi18mrs1/exec'

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedSj.value = filteredList.value.map(sj => sj.id)
  } else {
    selectedSj.value = []
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedSheetUrl.value)
  copySuccessMessage.value = true
  setTimeout(() => {
    copySuccessMessage.value = false
  }, 2000)
}

const closeModal = () => {
  showSuccessModal.value = false
  selectedSj.value = [] // Reset selection only after closing
}

const sendToGoogleSheets = async () => {
  if (selectedSj.value.length === 0) return
  isSendingToSheets.value = true
  showSuccessModal.value = true
  isCreatingSheet.value = true
  
  try {
    const { data: fullData, error } = await supabase
      .from('surat_jalan')
      .select('*')
      .in('id', selectedSj.value)
      
    if (error) throw error

    // Fetch user names
    const { data: usersData } = await supabase.from('users').select('id, name, email')
    const getUserName = (id) => {
      if (!usersData) return id
      const user = usersData.find(u => u.id === id)
      return user ? (user.name || user.email) : id
    }
    
    const payload = fullData.map(sj => ({
      nomor_dokumen: sj.nomor_dokumen || '-',
      customer: sj.customer || '-',
      tanggal_pengiriman: sj.tanggal_pengiriman || '-',
      status: sj.status || '-',
      data_barang: sj.data_barang || '-',
      penerima_nama: sj.penerima_nama || '-',
      waktu_diterima: sj.bukti_at ? new Date(sj.bukti_at).toLocaleString('id-ID') : '-',
      catatan_pengiriman: sj.catatan_delivery || '-',
      lokasi: `${sj.bukti_latitude || '-'}, ${sj.bukti_longitude || '-'}`,
      foto_bukti: sj.bukti_foto_url ? `=HYPERLINK("${sj.bukti_foto_url}"; "Lihat Foto Bukti")` : '-',
      dibuat_oleh: getUserName(sj.admin_id)
    }))
    
    // HTTP POST ke Google Sheets
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    })
    
    let result;
    const responseText = await response.text();
    try {
      result = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Bukan JSON:', responseText);
      throw new Error('Respons dari server bukan JSON. Kemungkinan diblokir oleh Google Login atau URL salah.');
    }
    
    if (result.status === 'success') {
      generatedSheetUrl.value = result.url
      isCreatingSheet.value = false
    } else {
      throw new Error(result.message || 'Gagal membuat spreadsheet')
    }
  } catch (err) {
    console.error(err)
    alert('Error: ' + err.message)
    showSuccessModal.value = false
  } finally {
    isSendingToSheets.value = false
  }
}



const tabs = [
  { id: 'semua', name: 'Semua Aktif', statuses: ['DRAFT', 'ASSIGNED', 'ACCEPTED', 'ON_DELIVERY', 'DELIVERED', 'COMPLETED'] },
  { id: 'draft', name: 'Draft & Batal', statuses: ['DRAFT', 'CANCELLED', 'DELETED'] },
  { id: 'berjalan', name: 'Sedang Berjalan', statuses: ['ASSIGNED', 'ACCEPTED', 'ON_DELIVERY'] },
  { id: 'selesai', name: 'Selesai', statuses: ['DELIVERED', 'COMPLETED'] }
]

onMounted(() => {
  fetchSuratJalan()
})

const fetchSuratJalan = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('id, nomor_dokumen, status, customer, tanggal_pengiriman, supir_id, created_at')
      .limit(300)
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
  const tab = tabs.find(t => t.id === activeTab.value)
  let list = suratJalanList.value
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(sj => sj.nomor_dokumen.toLowerCase().includes(q) || sj.customer.toLowerCase().includes(q))
  }
  
  if (tab) {
    list = list.filter(sj => tab.statuses.includes(sj.status))
  }

  // Filter 30 hari untuk status Selesai jika tidak ada pencarian
  if (activeTab.value === 'selesai' && !searchQuery.value) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    list = list.filter(sj => new Date(sj.created_at) >= thirtyDaysAgo)
  }
  
  return list
})

const getTabCount = (tabId) => {
  const tab = tabs.find(t => t.id === tabId)
  if (!tab) return 0
  return suratJalanList.value.filter(sj => tab.statuses.includes(sj.status)).length
}
</script>
