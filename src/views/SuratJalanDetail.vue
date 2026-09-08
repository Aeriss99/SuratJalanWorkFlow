<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main v-if="sj" class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Detail Surat Jalan</h1>
          <p class="text-sm font-bold text-gray-500 mt-1">{{ sj.nomor_dokumen }}</p>
        </div>
                <div class="flex flex-wrap gap-3 w-full sm:w-auto">
          <router-link v-if="['DRAFT', 'ASSIGNED'].includes(sj.status)" :to="`/surat-jalan/${sj.id}/edit`" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-gray-900 bg-yellow-100 hover:bg-yellow-200 active:translate-y-0.5 active:shadow-none transition-all">
            Edit
          </router-link>
          <button v-if="['CANCELLED', 'DELETED'].includes(sj.status) && isAdmin" @click="restoreToDraft" :disabled="submitting" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-gray-900 bg-blue-300 hover:bg-blue-400 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            Pulihkan ke Draf
          </button>
          <button v-if="sj.status === 'DELETED' && isAdmin" @click="hardDeleteDocument" :disabled="submitting" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-red-900 shadow-neo text-sm font-bold rounded-xl text-white bg-red-800 hover:bg-red-900 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            Hapus Permanen
          </button>
          <button v-if="!['DELETED'].includes(sj.status) && isAdmin" @click="deleteDocument" :disabled="submitting" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            Hapus
          </button>
          <button v-if="!['CANCELLED', 'DELETED'].includes(sj.status) && isAdmin" @click="cancelDocument" :disabled="submitting" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-gray-900 bg-red-100 hover:bg-red-200 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            Batalkan
          </button>
          <button @click="exportPdf" :disabled="exportingPdf" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-gray-900 bg-white hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            {{ exportingPdf ? 'Memproses...' : 'Ekspor PDF' }}
          </button>
          <button @click="exportExcel" :disabled="exportingExcel" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-green-700 shadow-neo text-sm font-bold rounded-xl text-green-900 bg-green-100 hover:bg-green-200 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            {{ exportingExcel ? 'Memproses...' : 'Ekspor Excel' }}
          </button>
        </div>
      </div>

      <div class="mt-4 px-4 sm:px-0 space-y-6">
        <!-- Main Document Data -->
        <div class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl p-6 sm:p-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-4">Informasi Pengiriman</h3>
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <dt class="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</dt>
                  <dd class="mt-1 text-sm font-bold px-3 py-1 rounded-full border-2 inline-block" :class="statusColor(sj.status)">
                    {{ getStatusLabel(sj.status) }}
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</dt>
                  <dd class="mt-1 text-base font-bold text-gray-900">{{ sj.customer }}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-xs font-bold text-gray-500 uppercase tracking-wider">Tgl Pengiriman</dt>
                  <dd class="mt-1 text-sm font-bold text-gray-900">{{ sj.tanggal_pengiriman }}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 class="text-lg font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-4">Data Barang</h3>
              <div class="text-sm font-medium text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border-2 border-gray-200">{{ sj.data_barang }}</div>
            </div>
          </div>
        </div>

        <!-- ================= WORKFLOW ACTIONS ================= -->
        
        
                        

        
        

        
        

        <!-- DRAFT (Pulihan) -->
        <div v-if="sj.status === 'DRAFT'" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6 text-center">
          <button @click="changeStatusSafe('ON_DELIVERY', 'STARTED_DELIVERY', 'Mulai pengiriman dokumen ini?')" :disabled="submitting" class="w-full bg-purple-400 border-2 border-gray-900 text-gray-900 font-black px-6 py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all text-xl">
            MULAI PENGIRIMAN
          </button>
        </div>

        <!-- ON_DELIVERY (Check in / Proof) -->
        <div v-if="sj.status === 'ON_DELIVERY'" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6 space-y-6">
          <h3 class="font-black text-xl text-center uppercase">Penyelesaian Pengiriman (Bukti Pengiriman)</h3>
          
          <div v-if="!fotoData" class="border-2 border-dashed border-gray-400 bg-gray-50 rounded-2xl p-10 text-center cursor-pointer hover:bg-gray-100 transition-colors" @click="$refs.cameraInput.click()">
            <p class="text-gray-900 font-black text-lg">AMBIL FOTO BUKTI</p>
          </div>
          <input type="file" accept="image/*" capture="environment" ref="cameraInput" class="hidden" @change="handleFotoUpload" />
          
          <div v-if="fotoData" class="space-y-6">
            <div class="relative">
              <img :src="fotoPreview" class="w-full h-64 object-cover rounded-xl border-2 border-gray-900 shadow-neo" />
              <button @click="fotoData = null; fotoPreview = null" class="absolute -top-3 -right-3 bg-red-500 border-2 border-gray-900 text-white font-bold px-3 py-1 rounded-full shadow-neo">X</button>
            </div>
            
            <div>
              <label class="block text-sm font-bold mb-2">Nama Penerima</label>
              <input type="text" v-model="penerimaNama" class="w-full border-2 border-gray-900 rounded-xl p-3 font-bold focus:ring-0" />
            </div>

            <div>
              <label class="block text-sm font-bold mb-2">Catatan (Opsional)</label>
              <textarea v-model="catatanDelivery" rows="2" class="w-full border-2 border-gray-900 rounded-xl p-3 font-medium focus:ring-0"></textarea>
            </div>

            <div>
              <label class="block text-sm font-bold mb-2">Tanda Tangan Penerima</label>
              <div class="border-2 border-dashed border-gray-400 h-48 bg-gray-50 rounded-xl relative">
                <VueSignaturePad width="100%" height="100%" ref="sigPenerima" />
                <button @click="$refs.sigPenerima.clearSignature()" class="absolute top-2 right-2 text-xs font-bold bg-white border-2 border-gray-900 px-2 py-1 rounded shadow-neo">Hapus</button>
              </div>
            </div>

            <button @click="submitDelivery" :disabled="submitting" class="w-full bg-teal-400 border-2 border-gray-900 text-gray-900 font-black px-6 py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all text-lg">
              {{ submitting ? 'MEMPROSES...' : 'SELESAIKAN PENGIRIMAN' }}
            </button>
          </div>
        </div>

        <!-- DELIVERED (Complete) -->
        <div v-if="sj.status === 'DELIVERED'" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6 text-center">
          <p class="mb-4 font-bold text-gray-600">Pengiriman telah diselesaikan. Validasi bukti dan tutup dokumen.</p>
          <button @click="changeStatus('COMPLETED', 'Dokumen diverifikasi dan ditutup')" :disabled="submitting" class="bg-blue-400 border-2 border-gray-900 text-gray-900 font-black px-8 py-3 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
            TANDAI SELESAI
          </button>
        </div>

        <!-- ================= DATA DISPLAYS ================= -->

        <!-- Signatures Display -->
        <div v-if="sj.penerima_signature" class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl p-6 sm:p-8 flex justify-center text-center">
          <div class="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 w-full max-w-sm">
            <p class="text-sm font-black text-gray-800 mb-4 uppercase tracking-wider">Penerima ({{ sj.penerima_nama }})</p>
            <img :src="sj.penerima_signature" class="mx-auto h-24 object-contain mix-blend-multiply" />
            <p class="text-xs font-bold text-gray-500 mt-4">{{ formatDate(sj.bukti_at) }}</p>
          </div>
        </div>

        <!-- Proof Display -->
        <div v-if="sj.bukti_foto_url" class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl p-6 sm:p-8">
          <h3 class="text-lg font-black text-gray-900 mb-6">Bukti Pengiriman (POD)</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <img :src="sj.bukti_foto_url" crossorigin="anonymous" class="rounded-xl border-2 border-gray-900 shadow-neo w-full h-auto max-h-64 object-cover" />
            </div>
            <div class="flex flex-col justify-center space-y-4">
              <div class="bg-teal-50 p-4 rounded-xl border-2 border-teal-600">
                <p class="text-xs font-bold text-teal-800 uppercase">Waktu Pengiriman</p>
                <p class="text-sm font-black text-teal-900">{{ formatDate(sj.bukti_at) }}</p>
              </div>
              <div class="bg-teal-50 p-4 rounded-xl border-2 border-teal-600">
                <p class="text-xs font-bold text-teal-800 uppercase">Catatan</p>
                <p class="text-sm font-bold text-teal-900">{{ sj.catatan_delivery || '-' }}</p>
              </div>
              <div class="bg-teal-50 p-4 rounded-xl border-2 border-teal-600">
                <p class="text-xs font-bold text-teal-800 uppercase">Lokasi GPS</p>
                <p class="font-mono text-xs font-bold text-teal-900 mt-1">{{ sj.bukti_latitude || 'Tidak ada' }}, {{ sj.bukti_longitude || 'Tidak ada' }}</p>
                <a v-if="sj.bukti_latitude" :href="`https://www.google.com/maps/search/?api=1&query=${sj.bukti_latitude},${sj.bukti_longitude}`" target="_blank" class="mt-2 inline-block px-3 py-1.5 border-2 border-teal-800 rounded-lg text-xs font-bold text-teal-900 bg-white shadow-[2px_2px_0_rgb(13,148,136)] active:translate-y-0.5 active:shadow-none">Lihat Peta</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Trail -->
        <div class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl p-6 sm:p-8">
          <h3 class="text-lg font-black text-gray-900 mb-6">Riwayat Aktivitas (Audit Trail)</h3>
          <div v-if="history.length" class="space-y-4">
            <div v-for="h in history" :key="h.id" class="flex gap-4 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-gray-900">{{ h.action }}</p>
                <p class="text-xs font-medium text-gray-500 mt-1">{{ getHistoryUserName(h.actor_id) }} • {{ formatDate(h.created_at) }}</p>
                <p v-if="h.reason" class="text-xs font-bold text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">Alasan: {{ h.reason }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="text-[10px] font-bold px-2 py-1 rounded bg-gray-200 border border-gray-300 text-gray-600">{{ h.status_before || 'NONE' }}</span>
                <span class="mx-1 text-gray-400">→</span>
                <span class="text-[10px] font-bold px-2 py-1 rounded border-2" :class="statusColor(h.status_after)">{{ h.status_after }}</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 font-bold">Belum ada history.</p>
        </div>

      </div>

      <!-- PDF Template -->
      <div class="fixed top-0 left-0 opacity-0 pointer-events-none z-[-50] w-[800px] bg-white text-black p-10 font-sans" id="pdf-template">
        <!-- Kept similar, updated for new fields -->
        <div class="border-b-4 border-gray-900 pb-6 mb-8 text-center">
          <h1 class="text-4xl font-black tracking-tight uppercase">Surat Jalan</h1>
          <p class="text-lg font-bold text-gray-500 mt-2">{{ sj.nomor_dokumen }}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase mb-1">Customer</p>
            <p class="text-xl font-black">{{ sj.customer }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Pengiriman</p>
            <p class="text-lg font-bold">{{ sj.tanggal_pengiriman }}</p>
          </div>
        </div>

        <div class="mb-12">
          <p class="text-xs font-bold text-gray-500 uppercase mb-2">Data Barang</p>
          <div class="p-6 border-2 border-gray-900 rounded-xl whitespace-pre-wrap font-medium text-base">
            {{ sj.data_barang }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-12 text-center mb-12">
          <div>
            <p class="text-sm font-bold text-gray-900 mb-6">Dibuat Oleh</p>
            <div class="h-32 flex items-end justify-center pb-4">
               <p class="font-bold text-lg text-gray-800">{{ getHistoryUserName(sj.admin_id) }}</p>
            </div>
            <p class="text-xs text-gray-500 font-medium mt-2">{{ formatDate(sj.created_at) || '-' }}</p>
          </div>
          
          <div>
            <p class="text-sm font-bold text-gray-900 mb-6">Penerima ({{ sj.penerima_nama || '____' }})</p>
            <div v-if="sj.penerima_signature" class="h-32 flex items-center justify-center">
              <img :src="sj.penerima_signature" class="h-full object-contain" />
            </div>
            <div v-else class="h-32 border-b-2 border-dashed border-gray-400 mx-8"></div>
            <p class="text-xs text-gray-500 font-medium mt-2">{{ formatDate(sj.bukti_at) || '-' }}</p>
          </div>
        </div>
        
        <div class="text-xs font-bold text-center mt-12 text-gray-400">
          Status Dokumen: {{ getStatusLabel(sj.status) }} | Dicetak: {{ new Date().toLocaleString('id-ID') }}
        </div>
      </div>
    </main>
    
    <div v-else-if="!loading" class="text-center py-12">
      <h3 class="text-lg font-bold text-gray-900">Data tidak ditemukan</h3>
    </div>
  </div>

    <!-- Unified Confirm Modal -->
    <Teleport to="body">
      <div v-if="modalConfig.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
        <div class="bg-white border-4 border-gray-900 shadow-neo rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
          <h3 class="text-xl font-black text-gray-900 mb-2">{{ modalConfig.title }}</h3>
          <p class="text-sm font-bold mb-4" :class="modalConfig.danger ? 'text-red-600' : 'text-gray-600'">{{ modalConfig.message }}</p>
          
          <div v-if="modalConfig.requireReason" class="mb-6">
            <label class="block text-sm font-bold text-gray-900 mb-2">{{ modalConfig.reasonLabel }}</label>
            <textarea 
              v-model="modalConfig.reason" 
              rows="3" 
              class="w-full border-2 border-gray-900 rounded-xl p-3 font-medium focus:ring-0 focus:border-blue-600 outline-none"
              placeholder="Masukkan alasan..."
            ></textarea>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="closeModal" class="flex-1 px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-bold hover:bg-gray-100 transition-colors">
              Kembali
            </button>
            <button @click="confirmModal" :disabled="(modalConfig.requireReason && !modalConfig.reason.trim()) || submitting" 
              class="flex-1 px-4 py-3 border-2 border-gray-900 rounded-xl font-black shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0"
              :class="modalConfig.danger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-400 text-gray-900 hover:bg-blue-500'">
              {{ modalConfig.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { getStatusLabel, statusColor } from '@/utils/status'
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sj = ref(null)
const history = ref([])
const loading = ref(true)
const submitting = ref(false)
const { showToast } = useToast()

const usersList = ref([])
const supirName = ref('')

const exportingPdf = ref(false)
const exportingExcel = ref(false)
const sigAdmin = ref(null)
const sigPenerima = ref(null)
const cameraInput = ref(null)
const fotoData = ref(null)
const fotoPreview = ref(null)
const penerimaNama = ref('')
const catatanDelivery = ref('')


const isAdmin = computed(() => {
  if (!sj.value) return false
  return sj.value.admin_id === authStore.user.id || authStore.user.id !== sj.value.supir_id
})


const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

const fetchAllUsers = async () => {
  const { data } = await supabase.from('users').select('*')
  if (data) usersList.value = data
}

const getHistoryUserName = (id) => {
  const u = usersList.value.find(user => user.id === id)
  return u ? (u.name || u.email) : 'System'
}

const fetchDetail = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('*')
      .eq('id', route.params.id)
      .single()
      
    if (error) throw error
    sj.value = data

    if (data.supir_id) {
      const u = usersList.value.find(user => user.id === data.supir_id)
      if (u) supirName.value = u.name || u.email
    }
    
    // Fetch History
    const { data: historyData } = await supabase
      .from('sj_history')
      .select('*')
      .eq('sj_id', data.id)
      .order('created_at', { ascending: true })
    
    if (historyData) history.value = historyData
    
  } catch (err) {
    console.error(err)
    showToast('Gagal memuat detail', 'error')
  } finally {
    loading.value = false
  }
}

const logHistory = async (action, statusAfter, reason = null) => {
  await supabase.from('sj_history').insert({
    sj_id: sj.value.id,
    actor_id: authStore.user.id,
    action: action,
    status_before: sj.value.status,
    status_after: statusAfter,
    reason: reason
  })
}


const modalConfig = ref({
  show: false,
  title: '',
  message: '',
  requireReason: false,
  reasonLabel: 'Alasan:',
  reason: '',
  danger: false,
  confirmText: 'Lanjutkan',
  onConfirm: null
})

const openModal = (config) => {
  modalConfig.value = {
    show: true,
    title: config.title || 'Konfirmasi',
    message: config.message || '',
    requireReason: config.requireReason || false,
    reasonLabel: config.reasonLabel || 'Alasan:',
    reason: '',
    danger: config.danger || false,
    confirmText: config.confirmText || 'Lanjutkan',
    onConfirm: config.onConfirm
  }
}

const closeModal = () => {
  modalConfig.value.show = false
}

const confirmModal = () => {
  if (modalConfig.value.requireReason && !modalConfig.value.reason.trim()) {
    showToast('Alasan harus diisi', 'error')
    return
  }
  if (modalConfig.value.onConfirm) {
    modalConfig.value.onConfirm(modalConfig.value.reason)
  }
  closeModal()
}


const hardDeleteDocument = () => {
  openModal({
    title: 'Hapus Permanen',
    message: 'Tindakan ini tidak dapat dibatalkan. Dokumen akan lenyap dari database selamanya.',
    danger: true,
    confirmText: 'Hapus Permanen',
    onConfirm: async () => {
      try {
        submitting.value = true
        
        // Trik Bypass RLS: Ubah status jadi DRAFT sesaat sebelum dihapus,
        // berjaga-jaga jika database pengguna masih menggunakan Policy RLS lama.
        await supabase.from('surat_jalan').update({ status: 'DRAFT' }).eq('id', sj.value.id)
        
        const { error } = await supabase.from('surat_jalan').delete().eq('id', sj.value.id)
        if (error) throw error
        
        showToast('Dokumen dihapus permanen', 'success')
        router.push('/')
      } catch (err) {
        console.error("Error Hapus Permanen:", err)
        showToast('Gagal menghapus permanen: ' + (err.message || 'Error Database'), 'error')
      } finally {
        submitting.value = false
      }
    }
  })
}

const deleteDocument = () => {
  openModal({
    title: 'Hapus Dokumen',
    message: 'Apakah Anda yakin ingin memindahkan dokumen ini ke arsip (Soft Delete)?',
    danger: true,
    confirmText: 'Hapus',
    onConfirm: () => {
      changeStatus('DELETED', 'DELETED_SOFT', 'Dihapus oleh pengguna')
    }
  })
}

const restoreToDraft = () => {
  openModal({
    title: 'Pulihkan Dokumen',
    message: 'Dokumen ini akan diaktifkan kembali menjadi Draf. Lanjutkan?',
    confirmText: 'Pulihkan',
    onConfirm: () => {
      changeStatus('DRAFT', 'RESTORED_TO_DRAFT', 'Dipulihkan dari Batal/Hapus')
    }
  })
}

const cancelDocument = () => {
  openModal({
    title: 'Batalkan Dokumen',
    message: 'Peringatan: Dokumen yang dibatalkan tidak bisa dikembalikan. Lanjutkan?',
    danger: true,
    requireReason: true,
    reasonLabel: 'Alasan membatalkan dokumen ini:',
    confirmText: 'Batalkan Dokumen',
    onConfirm: (reason) => {
      changeStatus('CANCELLED', 'CANCELLED', reason)
    }
  })
}

const changeStatusSafe = (newStatus, actionLabel, promptText = null) => {
  if (promptText) {
    openModal({
      title: 'Konfirmasi',
      message: promptText,
      confirmText: 'Ya, Lanjutkan',
      onConfirm: () => {
        changeStatus(newStatus, actionLabel)
      }
    })
  } else {
    changeStatus(newStatus, actionLabel)
  }
}

const changeStatus = async (newStatus, actionLabel = 'STATUS_CHANGED', reason = null) => {
  try {
    submitting.value = true
    const { error } = await supabase
      .from('surat_jalan')
      .update({ status: newStatus,   })
      .eq('id', sj.value.id)
      
    if (error) throw error
    await logHistory(actionLabel, newStatus, reason)
    showToast('Sukses update status', 'success')
    router.push('/')
  } catch (err) {
    showToast('Gagal update status', 'error')
    console.error(err)
  } finally {
    submitting.value = false
  }
}














const handleFotoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  fotoData.value = file
  const reader = new FileReader()
  reader.onload = (e) => fotoPreview.value = e.target.result
  reader.readAsDataURL(file)
}

const getGPSLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: null, lng: null })
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

const submitDelivery = async () => {
  if (!fotoData.value || !penerimaNama.value) return showToast('Foto dan Nama Penerima wajib diisi', 'error')
  
  const { isEmpty, data: sigData } = sigPenerima.value.saveSignature()
  if (isEmpty) return showToast('Tanda tangan penerima wajib diisi', 'error')

  openModal({
    title: 'Selesaikan Pengiriman',
    message: 'Selesaikan pengiriman sekarang?',
    confirmText: 'Selesaikan',
    onConfirm: async () => {
      try {
    submitting.value = true
    const gps = await getGPSLocation()
    
    const fileExt = fotoData.value.name.split('.').pop()
    const fileName = `${sj.value.id}-${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from('bukti').upload(fileName, fotoData.value)
    
    
    if (uploadError) {
      console.error('Upload Error:', uploadError)
      throw new Error('Gagal mengunggah foto: ' + (uploadError.message || 'Storage Bucket mungkin belum dibuat di Supabase.'))
    }
    
    const { data: publicUrlData } = supabase.storage.from('bukti').getPublicUrl(fileName)
    const photoUrl = publicUrlData.publicUrl

    const { error } = await supabase
      .from('surat_jalan')
      .update({
        status: 'DELIVERED',
        bukti_foto_url: photoUrl,
        bukti_latitude: gps.lat,
        bukti_longitude: gps.lng,
        bukti_at: new Date().toISOString(),
        penerima_nama: penerimaNama.value,
        penerima_signature: sigData,
        catatan_delivery: catatanDelivery.value
      })
      .eq('id', sj.value.id)
      .eq('status', 'ON_DELIVERY')
      
    if (error) {
      // Hapus orphan photo
      await supabase.storage.from('bukti').remove([fileName])
      throw error
    }

    await logHistory('DELIVERY_FINISHED', 'DELIVERED')
    showToast('Pengiriman Selesai', 'success')
    router.push('/')
      } catch (err) {
        showToast(err.message, 'error')
      } finally {
        submitting.value = false
      }
    }
  })
}

const exportPdf = async () => {
  const element = document.getElementById('pdf-template')
  if (!element) return
  try {
    exportingPdf.value = true
    const [{ jsPDF }, html2canvasModule] = await Promise.all([import('jspdf'), import('html2canvas')])
    const html2canvas = html2canvasModule.default || html2canvasModule
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/jpeg', 0.8)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${sj.value.nomor_dokumen}.pdf`)
    showToast('PDF berhasil didownload', 'success')
  } catch (err) {
    console.error("Error Export PDF:", err)
    showToast('Gagal ekspor PDF: ' + (err.message || 'Error'), 'error')
  } finally {
    exportingPdf.value = false
  }
}

const exportExcel = async () => {
  try {
    exportingExcel.value = true
    const xlsxModule = await import('xlsx')
    const XLSX = xlsxModule.default || xlsxModule
    
    // Siapkan data untuk excel
    const excelData = [
      ['SURAT JALAN'],
      [''],
      ['Nomor Dokumen', sj.value.nomor_dokumen],
      ['Customer / Tujuan', sj.value.customer],
      ['Tanggal Pengiriman', sj.value.tanggal_pengiriman],
      ['Status', sj.value.status],
      [''],
      ['DATA BARANG'],
      [sj.value.data_barang],
      [''],
      ['INFORMASI PENERIMA'],
      ['Nama Penerima', sj.value.penerima_nama || '-'],
      ['Waktu Diterima', formatDate(sj.value.bukti_at)],
      ['Catatan Pengiriman', sj.value.catatan_delivery || '-'],
      ['Lokasi (Lat, Lng)', `${sj.value.bukti_latitude || '-'}, ${sj.value.bukti_longitude || '-'}`],
      [''],
      ['Dibuat Oleh', getHistoryUserName(sj.value.admin_id)]
    ]

    const ws = XLSX.utils.aoa_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Surat Jalan')
    
    // Mengatur lebar kolom agar rapi
    ws['!cols'] = [{ wch: 20 }, { wch: 40 }]

    XLSX.writeFile(wb, `${sj.value.nomor_dokumen}.xlsx`)
    showToast('Excel berhasil didownload', 'success')
  } catch (err) {
    console.error("Error Export Excel:", err)
    showToast('Gagal ekspor Excel: ' + (err.message || 'Error'), 'error')
  } finally {
    exportingExcel.value = false
  }
}

onMounted(async () => {
  await fetchAllUsers()
  fetchDetail()
})
</script>
