<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Daftar Surat Jalan</h1>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          <select v-model="customerFilter" class="block w-full sm:w-48 px-4 py-2.5 rounded-xl border-2 border-gray-900 text-sm font-bold shadow-sm bg-white focus:ring-0 focus:border-blue-600 appearance-none">
            <option value="">Semua Customer</option>
            <option v-for="c in uniqueCustomers" :key="c" :value="c">{{ c }}</option>
          </select>
          <div class="relative w-full sm:w-56">
            <div @click="showDateRange = !showDateRange" class="cursor-pointer flex items-center justify-between w-full px-4 py-2.5 rounded-xl border-2 border-gray-900 text-sm font-bold shadow-sm bg-white hover:bg-gray-50">
              <span class="truncate">{{ formattedDateRange }}</span>
            </div>
            <div v-if="showDateRange" class="absolute z-50 mt-2 p-4 bg-white border-2 border-gray-900 rounded-xl shadow-neo w-64 right-0 sm:left-0">
              <div class="mb-3">
                <label class="block text-xs font-bold text-gray-700 mb-1">Mulai Tanggal</label>
                <input type="date" v-model="dateStart" class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm" />
              </div>
              <div class="mb-4">
                <label class="block text-xs font-bold text-gray-700 mb-1">Sampai Tanggal</label>
                <input type="date" v-model="dateEnd" class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm" />
              </div>
              <div class="flex justify-end gap-2">
                <button @click="resetDateRange" class="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Reset</button>
                <button @click="showDateRange = false" class="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Terapkan</button>
              </div>
            </div>
          </div>
          <input type="text" v-model="searchQuery" placeholder="Cari No. SJ / Customer..." class="block w-full sm:w-48 px-4 py-2.5 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 text-sm font-bold shadow-sm" />
          <!-- Sengaja tidak disembunyikan di mobile karena link navbar mobile sudah dihapus (lihat Tugas 3) -->
          <button v-if="selectedSj.length > 0" @click="sendToGoogleSheets" :disabled="isSendingToSheets" class="inline-flex justify-center items-center px-4 py-2.5 border-2 border-gray-900 text-sm font-bold rounded-xl shadow-neo text-green-900 bg-green-400 hover:bg-green-500 active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap disabled:opacity-50">
            {{ isSendingToSheets ? 'Mengirim...' : 'Ke Sheets (' + selectedSj.length + ')' }}
          </button>
          <router-link to="/surat-jalan/create" class="inline-flex justify-center items-center px-4 py-2.5 border-2 border-gray-900 text-sm font-bold rounded-xl shadow-neo text-gray-900 bg-blue-400 hover:bg-blue-500 active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap">
            Buat Baru
          </router-link>
        </div>
      </div>

      <!-- Filter Cards -->
      <div class="px-4 sm:px-0 mb-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div v-for="tab in tabs" :key="tab.id" 
             @click="activeTab = tab.id"
             :class="[
               'cursor-pointer rounded-2xl p-4 transition-all hover:translate-y-[-2px] border-2',
               tab.bg,
               activeTab === tab.id ? 'shadow-neo ' + tab.activeBorder : 'border-transparent opacity-80 hover:opacity-100 hover:border-gray-300'
             ]">
          <p class="text-xs font-bold uppercase" :class="tab.text">{{ tab.name }}</p>
          <p class="text-2xl font-black" :class="tab.text">{{ getTabCount(tab.id) }}</p>
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
              <div v-if="sj.status === 'CANCELLED'" class="px-4 pb-4 sm:px-6 sm:pb-5">
                <div class="pt-4 border-t-2 border-gray-100 flex gap-2">
                  <button @click="restoreSj(sj)" class="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors">Pulihkan</button>
                  <button @click="confirmArchive(sj)" class="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg border-2 border-red-200 hover:bg-red-100 transition-colors">Arsipkan</button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="filteredList.length === 0 && !loading" class="px-4 py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 class="mt-2 text-base font-bold text-gray-900">{{ getEmptyState().title }}</h3>
            <p class="mt-1 text-sm font-medium text-gray-500 mb-4">
              {{ getEmptyState().subtitle }}
            </p>
            <router-link v-if="getEmptyState().showCTA" to="/surat-jalan/create" class="inline-flex items-center px-4 py-2 border-2 border-gray-900 text-sm font-bold rounded-xl shadow-neo text-gray-900 bg-blue-400 hover:bg-blue-500 active:translate-y-0.5 active:shadow-none transition-all">
              + Buat Surat Jalan Pertama
            </router-link>
          </div>
        </div>

        <div v-if="loading" class="px-4 py-12 text-center text-gray-500 font-bold">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p>Memuat data...</p>
        </div>
      </div>
    
      <!-- Modal Konfirmasi Arsip -->
      <Teleport to="body">
        <div v-if="showArchiveModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div class="bg-white border-4 border-gray-900 shadow-neo rounded-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 class="text-xl font-black text-gray-900 mb-2">Konfirmasi Arsip</h3>
            <p class="text-sm font-medium text-gray-600 mb-6">Surat jalan ini akan diarsipkan dan tidak akan tampil lagi di daftar. Lanjutkan?</p>
            <div class="flex gap-3">
              <button @click="showArchiveModal = false" class="flex-1 px-4 py-2 border-2 border-gray-900 rounded-xl text-gray-900 font-bold hover:bg-gray-100 transition-colors">Batalkan</button>
              <button @click="processArchive" class="flex-1 px-4 py-2 border-2 border-gray-900 rounded-xl font-black shadow-neo active:translate-y-0.5 active:shadow-none transition-all bg-red-400 hover:bg-red-500 text-gray-900">Ya, Arsipkan</button>
            </div>
          </div>
        </div>
      </Teleport>
      
      <!-- Modal Konfirmasi Arsip -->
      <Teleport to="body">
        <div v-if="showArchiveModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div class="bg-white border-4 border-gray-900 shadow-neo rounded-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 class="text-xl font-black text-gray-900 mb-2">Konfirmasi Arsip</h3>
            <p class="text-sm font-medium text-gray-600 mb-6">Surat jalan ini akan diarsipkan dan tidak akan tampil lagi di daftar. Lanjutkan?</p>
            <div class="flex gap-3">
              <button @click="showArchiveModal = false" class="flex-1 px-4 py-2 border-2 border-gray-900 rounded-xl text-gray-900 font-bold hover:bg-gray-100 transition-colors">Batalkan</button>
              <button @click="processArchive" class="flex-1 px-4 py-2 border-2 border-gray-900 rounded-xl font-black shadow-neo active:translate-y-0.5 active:shadow-none transition-all bg-red-400 hover:bg-red-500 text-gray-900">Ya, Arsipkan</button>
            </div>
          </div>
        </div>
      </Teleport>
      
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

    
      <!-- Aktivitas Terbaru -->
      <div class="px-4 sm:px-0 mt-12 mb-6">
        <h2 class="text-xl font-black text-gray-900 mb-4">Aktivitas Terbaru</h2>
        <div v-if="recentList.length > 0" class="space-y-3">
          <router-link v-for="sj in recentList" :key="'recent-'+sj.id" :to="'/surat-jalan/'+sj.id" class="block bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:shadow-neo transition-all">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-bold text-gray-900">{{ sj.nomor_dokumen }}</p>
                <p class="text-sm text-gray-600">{{ sj.customer }}</p>
              </div>
              <span class="px-3 py-1 text-xs font-bold rounded-full border-2" :class="statusColor(sj.status)">
                {{ getStatusLabel(sj.status) }}
              </span>
            </div>
          </router-link>
        </div>
        <div v-else class="text-center py-6 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <p class="text-sm font-medium text-gray-500">Belum ada aktivitas</p>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-12 py-6 text-center text-sm font-medium text-gray-500 border-t-2 border-gray-200">
        <p>&copy; 2026 SJFlow Palate. Semua hak dilindungi.</p>
      </footer>

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
const customerFilter = ref('')
const dateStart = ref('')
const dateEnd = ref('')
const showDateRange = ref(false)

const resetDateRange = () => {
  dateStart.value = ''
  dateEnd.value = ''
  showDateRange.value = false
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const formattedDateRange = computed(() => {
  if (dateStart.value && dateEnd.value) {
    return `${formatDate(dateStart.value)} - ${formatDate(dateEnd.value)}`
  }
  if (dateStart.value) {
    return `${formatDate(dateStart.value)} - Seterusnya`
  }
  if (dateEnd.value) {
    return `Awal - ${formatDate(dateEnd.value)}`
  }
  return 'Pilih Tanggal'
})

const uniqueCustomers = computed(() => {
  const customers = suratJalanList.value.map(sj => sj.customer).filter(Boolean)
  return [...new Set(customers)].sort()
})

const getEmptyState = () => {
  if (searchQuery.value || customerFilter.value || dateStart.value || dateEnd.value) {
    return { title: 'Tidak ada data', subtitle: 'Tidak ada hasil yang cocok dengan pencarian dan filter Anda.', showCTA: false }
  }
  switch(activeTab.value) {
    case 'semua': return { title: 'Belum ada Surat Jalan', subtitle: 'Mulai buat surat jalan pertamamu.', showCTA: true }
    case 'draft': return { title: 'Tidak ada draft', subtitle: 'Surat jalan yang belum difinalisasi akan muncul di sini.', showCTA: false }
    case 'batal': return { title: 'Tidak ada surat jalan yang dibatalkan', subtitle: 'Riwayat pembatalan akan muncul di sini.', showCTA: false }
    case 'berjalan': return { title: 'Tidak ada pengiriman yang sedang berjalan', subtitle: 'Surat jalan yang sedang dalam proses pengiriman akan muncul di sini.', showCTA: false }
    case 'selesai': return { title: 'Belum ada surat jalan yang selesai', subtitle: 'Riwayat pengiriman yang sudah selesai akan muncul di sini.', showCTA: false }
    default: return { title: 'Tidak ada data', subtitle: 'Belum ada Surat Jalan di kategori ini.', showCTA: false }
  }
}

const recentList = computed(() => {
  return [...suratJalanList.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
})


const selectedSj = ref([])
const isSendingToSheets = ref(false)
const showSuccessModal = ref(false)
const isCreatingSheet = ref(false)
const generatedSheetUrl = ref('')
const copySuccessMessage = ref(false)

const sjToArchive = ref(null)
const showArchiveModal = ref(false)

const restoreSj = async (sj) => {
  try {
    const newStatus = sj.previous_status || 'DRAFT'
    const { error } = await supabase
      .from('surat_jalan')
      .update({ status: newStatus, previous_status: null })
      .eq('id', sj.id)
      
    if (error) throw error
    
    // Update local state
    sj.status = newStatus
    sj.previous_status = null
    alert('Berhasil dipulihkan ke status ' + newStatus)
  } catch(e) {
    alert('Gagal memulihkan: ' + e.message)
  }
}

const confirmArchive = (sj) => {
  sjToArchive.value = sj
  showArchiveModal.value = true
}

const processArchive = async () => {
  if (!sjToArchive.value) return
  try {
    const { error } = await supabase
      .from('surat_jalan')
      .update({ status: 'DELETED' })
      .eq('id', sjToArchive.value.id)
      
    if (error) throw error
    
    // Update local state
    sjToArchive.value.status = 'DELETED'
    showArchiveModal.value = false
    sjToArchive.value = null
  } catch(e) {
    alert('Gagal mengarsipkan: ' + e.message)
  }
}




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
  { id: 'semua', name: 'Semua Aktif', statuses: ['DRAFT', 'ASSIGNED', 'ACCEPTED', 'ON_DELIVERY', 'DELIVERED', 'COMPLETED'],
    bg: 'bg-blue-50', text: 'text-blue-900', activeBorder: 'border-blue-500' },
  { id: 'draft', name: 'Draft', statuses: ['DRAFT'],
    bg: 'bg-gray-50', text: 'text-gray-700', activeBorder: 'border-gray-500' },
  { id: 'batal', name: 'Batal', statuses: ['CANCELLED'],
    bg: 'bg-red-50', text: 'text-red-900', activeBorder: 'border-red-500' },
  { id: 'berjalan', name: 'Sedang Berjalan', statuses: ['ASSIGNED', 'ACCEPTED', 'ON_DELIVERY'],
    bg: 'bg-orange-50', text: 'text-orange-900', activeBorder: 'border-orange-500' },
  { id: 'selesai', name: 'Selesai', statuses: ['DELIVERED', 'COMPLETED'],
    bg: 'bg-green-50', text: 'text-green-900', activeBorder: 'border-green-500' }
]

onMounted(() => {
  fetchSuratJalan()
})

const fetchSuratJalan = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('id, nomor_dokumen, status, previous_status, customer, tanggal_pengiriman, supir_id, created_at')
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
    list = list.filter(sj => sj.nomor_dokumen.toLowerCase().includes(q) || (sj.customer && sj.customer.toLowerCase().includes(q)))
  }

  if (customerFilter.value) {
    list = list.filter(sj => sj.customer === customerFilter.value)
  }

  if (dateStart.value || dateEnd.value) {
    list = list.filter(sj => {
      if (!sj.tanggal_pengiriman) return false;
      const sjDate = new Date(sj.tanggal_pengiriman);
      if (dateStart.value && sjDate < new Date(dateStart.value)) return false;
      if (dateEnd.value) {
        const endBoundary = new Date(dateEnd.value);
        endBoundary.setHours(23, 59, 59, 999);
        if (sjDate > endBoundary) return false;
      }
      return true;
    })
  }
  
  if (tab) {
    list = list.filter(sj => tab.statuses.includes(sj.status))
  }

  // Filter 30 hari untuk status Selesai jika tidak ada filter manual yang aktif
  if (activeTab.value === 'selesai' && !searchQuery.value && !customerFilter.value && !dateStart.value && !dateEnd.value) {
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
