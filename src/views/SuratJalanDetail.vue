<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <Navbar />
    
    <main v-if="sj" class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Detail Surat Jalan</h1>
          <p class="text-sm font-bold text-gray-500 mt-1">{{ sj.nomor_dokumen }}</p>
        </div>
        <div class="flex gap-3 w-full sm:w-auto">
          <button @click="exportPdf" :disabled="exportingPdf" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-gray-900 bg-white hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            {{ exportingPdf ? 'Memproses...' : 'Export PDF' }}
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
                    {{ sj.status }}
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
                <div class="sm:col-span-1">
                  <dt class="text-xs font-bold text-gray-500 uppercase tracking-wider">Driver Assignment</dt>
                  <dd class="mt-1 text-sm font-bold text-gray-900">
                    {{ supirName || 'Belum dipilih' }}
                  </dd>
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
        
        <!-- DRAFT -->
        <div v-if="sj.status === 'DRAFT'" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6">
          <h3 class="font-black text-lg mb-4">Aksi Dokumen: Draft</h3>
          <button @click="changeStatus('SUBMITTED')" :disabled="submitting" class="w-full sm:w-auto bg-blue-500 border-2 border-gray-900 text-gray-900 font-black px-6 py-3 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
            SUBMIT FOR REVIEW
          </button>
        </div>

        <!-- SUBMITTED (Review) -->
        <div v-if="sj.status === 'SUBMITTED'" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6">
          <h3 class="font-black text-lg mb-4">Aksi Dokumen: Review & Approval</h3>
          <div class="mb-6">
            <label class="block text-sm font-bold mb-2">Tanda Tangan Approver</label>
            <div class="border-2 border-dashed border-gray-400 h-48 bg-gray-50 rounded-xl relative">
              <VueSignaturePad width="100%" height="100%" ref="sigAdmin" />
              <button @click="$refs.sigAdmin.clearSignature()" class="absolute top-2 right-2 text-xs font-bold bg-white border-2 border-gray-900 px-2 py-1 rounded shadow-neo">Hapus</button>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <button @click="approveDocument" :disabled="submitting" class="flex-1 bg-green-400 border-2 border-gray-900 text-gray-900 font-black px-6 py-3 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
              APPROVE DOKUMEN
            </button>
            <button @click="promptReject" :disabled="submitting" class="flex-1 bg-red-400 border-2 border-gray-900 text-gray-900 font-black px-6 py-3 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
              REJECT
            </button>
          </div>
        </div>

        <!-- APPROVED (Assign) -->
        <div v-if="sj.status === 'APPROVED'" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6">
          <h3 class="font-black text-lg mb-4">Aksi Dokumen: Assign Driver</h3>
          <div class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="flex-1 w-full">
              <label class="block text-sm font-bold mb-2">Pilih Driver</label>
              <select v-model="selectedDriverId" class="block w-full border-2 border-gray-900 rounded-xl p-3 font-bold bg-white focus:ring-0">
                <option :value="null">-- Pilih Driver --</option>
                <option v-for="u in usersList" :key="u.id" :value="u.id">{{ u.name || u.email }}</option>
              </select>
            </div>
            <button @click="assignDriver" :disabled="submitting || !selectedDriverId" class="w-full sm:w-auto bg-orange-300 border-2 border-gray-900 text-gray-900 font-black px-6 py-3.5 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
              ASSIGN TUGAS
            </button>
          </div>
        </div>

        <!-- ASSIGNED (Driver Accept/Reject) -->
        <div v-if="sj.status === 'ASSIGNED' && isAssignedDriver" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6">
          <h3 class="font-black text-lg mb-4">Tugas Baru Ditetapkan Ke Anda</h3>
          <div class="flex flex-col sm:flex-row gap-4">
            <button @click="changeStatus('ACCEPTED', 'Menerima penugasan')" :disabled="submitting" class="flex-1 bg-indigo-300 border-2 border-gray-900 text-gray-900 font-black px-6 py-3 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
              TERIMA TUGAS
            </button>
            <button @click="rejectAssignment" :disabled="submitting" class="flex-1 bg-red-300 border-2 border-gray-900 text-gray-900 font-black px-6 py-3 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
              TOLAK TUGAS
            </button>
          </div>
        </div>
        <div v-if="sj.status === 'ASSIGNED' && !isAssignedDriver" class="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl text-orange-800 font-bold text-center">
          Menunggu driver ({{ supirName }}) merespon penugasan ini.
        </div>

        <!-- ACCEPTED (Start Delivery) -->
        <div v-if="sj.status === 'ACCEPTED' && isAssignedDriver" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6 text-center">
          <button @click="changeStatus('ON_DELIVERY', 'Mulai perjalanan')" :disabled="submitting" class="w-full bg-purple-400 border-2 border-gray-900 text-gray-900 font-black px-6 py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all text-xl">
            MULAI PENGIRIMAN
          </button>
        </div>

        <!-- ON_DELIVERY (Check in / Proof) -->
        <div v-if="sj.status === 'ON_DELIVERY' && isAssignedDriver" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-6 space-y-6">
          <h3 class="font-black text-xl text-center uppercase">Penyelesaian Pengiriman (POD)</h3>
          
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
          <p class="mb-4 font-bold text-gray-600">Pengiriman telah diselesaikan oleh driver. Validasi bukti dan tutup dokumen.</p>
          <button @click="changeStatus('COMPLETED', 'Dokumen diverifikasi dan ditutup')" :disabled="submitting" class="bg-blue-400 border-2 border-gray-900 text-gray-900 font-black px-8 py-3 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
            MARK AS COMPLETED
          </button>
        </div>

        <!-- ================= DATA DISPLAYS ================= -->

        <!-- Signatures Display -->
        <div v-if="sj.admin_signature || sj.penerima_signature" class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
          <div v-if="sj.admin_signature" class="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
            <p class="text-sm font-black text-gray-800 mb-4 uppercase tracking-wider">Approved By</p>
            <img :src="sj.admin_signature" class="mx-auto h-24 object-contain mix-blend-multiply" />
            <p class="text-xs font-bold text-gray-500 mt-4">{{ formatDate(sj.admin_signed_at) }}</p>
          </div>
          <div v-if="sj.penerima_signature" class="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
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
          <h3 class="text-lg font-black text-gray-900 mb-6">Activity History (Audit Trail)</h3>
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
      <div class="fixed top-[200vh] left-0 w-[800px] bg-white text-black p-10 font-sans" id="pdf-template">
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
            <p class="text-sm font-bold text-gray-900 mb-6">Approved By</p>
            <div v-if="sj.admin_signature" class="h-32 flex items-center justify-center">
              <img :src="sj.admin_signature" class="h-full object-contain" />
            </div>
            <div v-else class="h-32 border-b-2 border-dashed border-gray-400 mx-8"></div>
            <p class="text-xs text-gray-500 font-medium mt-2">{{ formatDate(sj.admin_signed_at) || '-' }}</p>
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
          Status Dokumen: {{ sj.status }} | Dicetak: {{ new Date().toLocaleString('id-ID') }}
        </div>
      </div>
    </main>
    
    <div v-else-if="!loading" class="text-center py-12">
      <h3 class="text-lg font-bold text-gray-900">Data tidak ditemukan</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const sj = ref(null)
const history = ref([])
const loading = ref(true)
const submitting = ref(false)
const { showToast } = useToast()

const usersList = ref([])
const supirName = ref('')
const selectedDriverId = ref(null)

const exportingPdf = ref(false)
const sigAdmin = ref(null)
const sigPenerima = ref(null)
const cameraInput = ref(null)
const fotoData = ref(null)
const fotoPreview = ref(null)
const penerimaNama = ref('')
const catatanDelivery = ref('')

const isAssignedDriver = computed(() => sj.value?.supir_id === authStore.user.id)

const statusColor = (status) => {
  const colors = {
    'DRAFT': 'bg-gray-100 text-gray-800 border-gray-900',
    'SUBMITTED': 'bg-yellow-100 text-yellow-900 border-yellow-900',
    'APPROVED': 'bg-green-100 text-green-900 border-green-900',
    'ASSIGNED': 'bg-orange-100 text-orange-900 border-orange-900',
    'ACCEPTED': 'bg-indigo-100 text-indigo-900 border-indigo-900',
    'ON_DELIVERY': 'bg-purple-100 text-purple-900 border-purple-900',
    'DELIVERED': 'bg-teal-100 text-teal-900 border-teal-900',
    'COMPLETED': 'bg-blue-100 text-blue-900 border-blue-900',
    'REJECTED': 'bg-red-100 text-red-900 border-red-900',
    'CANCELLED': 'bg-gray-300 text-gray-900 border-gray-900'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-900'
}

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

const changeStatus = async (newStatus, actionLabel = 'STATUS_CHANGED', reason = null) => {
  try {
    submitting.value = true
    const { error } = await supabase
      .from('surat_jalan')
      .update({ status: newStatus, rejection_reason: reason })
      .eq('id', sj.value.id)
      
    if (error) throw error
    await logHistory(actionLabel, newStatus, reason)
    showToast('Sukses update status', 'success')
    await fetchDetail()
  } catch (err) {
    showToast('Gagal update status', 'error')
    console.error(err)
  } finally {
    submitting.value = false
  }
}

const approveDocument = async () => {
  if (!sigAdmin.value) return
  const { isEmpty, data } = sigAdmin.value.saveSignature()
  if (isEmpty) return showToast('Harap berikan tanda tangan', 'error')
  
  try {
    submitting.value = true
    const { error } = await supabase
      .from('surat_jalan')
      .update({ 
        status: 'APPROVED', 
        admin_signature: data, 
        admin_signed_at: new Date().toISOString() 
      })
      .eq('id', sj.value.id)
      
    if (error) throw error
    await logHistory('APPROVED', 'APPROVED')
    showToast('Dokumen Approved', 'success')
    await fetchDetail()
  } catch (err) {
    showToast('Gagal approve', 'error')
  } finally {
    submitting.value = false
  }
}

const promptReject = () => {
  const reason = prompt("Alasan penolakan:")
  if (reason) changeStatus('REJECTED', 'REJECTED_BY_APPROVER', reason)
}

const rejectAssignment = () => {
  const reason = prompt("Alasan menolak tugas:")
  if (!reason) return
  
  // Revert back to APPROVED, remove supir_id
  supabase.from('surat_jalan')
    .update({ status: 'APPROVED', supir_id: null })
    .eq('id', sj.value.id)
    .then(async ({ error }) => {
      if (error) throw error
      await logHistory('ASSIGNMENT_REJECTED', 'APPROVED', reason)
      showToast('Assignment ditolak', 'success')
      fetchDetail()
    })
}

const assignDriver = async () => {
  if (!selectedDriverId.value) return
  try {
    submitting.value = true
    const { error } = await supabase
      .from('surat_jalan')
      .update({ status: 'ASSIGNED', supir_id: selectedDriverId.value })
      .eq('id', sj.value.id)
      
    if (error) throw error
    await logHistory('DRIVER_ASSIGNED', 'ASSIGNED')
    showToast('Driver berhasil di-assign', 'success')
    await fetchDetail()
  } catch(err) {
    showToast('Gagal assign', 'error')
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

  try {
    submitting.value = true
    const gps = await getGPSLocation()
    
    const fileExt = fotoData.value.name.split('.').pop()
    const fileName = `${sj.value.id}-${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from('bukti').upload(fileName, fotoData.value)
    
    let photoUrl = fotoPreview.value
    if (uploadData && !uploadError) {
      const { data: publicUrlData } = supabase.storage.from('bukti').getPublicUrl(fileName)
      photoUrl = publicUrlData.publicUrl
    }

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
      
    if (error) throw error
    await logHistory('DELIVERY_FINISHED', 'DELIVERED')
    showToast('Pengiriman Selesai', 'success')
    await fetchDetail()
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    submitting.value = false
  }
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
    showToast('Gagal ekspor PDF', 'error')
  } finally {
    exportingPdf.value = false
  }
}

onMounted(async () => {
  await fetchAllUsers()
  fetchDetail()
})
</script>
