<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <AdminNavbar />
    
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
          <button @click="exportExcel" :disabled="exportingExcel" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-gray-900 bg-white hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            {{ exportingExcel ? 'Memproses...' : 'Export Excel' }}
          </button>
        </div>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl">
          <div class="px-6 py-6 sm:p-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-4">Informasi Pengiriman</h3>
                <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <dt class="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</dt>
                    <dd class="mt-1 text-sm font-bold text-blue-800 bg-blue-100 border-2 border-blue-800 inline-block px-3 py-1 rounded-full">{{ sj.status }}</dd>
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
                    <dt class="text-xs font-bold text-gray-500 uppercase tracking-wider">Supir Ditugaskan</dt>
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

            <!-- Tanda Tangan Section -->
            <div class="mt-10 border-t-2 border-gray-200 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
              <div class="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <p class="text-sm font-black text-gray-800 mb-4 uppercase tracking-wider">Dibuat Oleh (Admin)</p>
                <div v-if="sj.admin_signature">
                  <img :src="sj.admin_signature" class="mx-auto h-24 object-contain mix-blend-multiply" alt="TTD Admin" />
                  <p class="text-xs font-bold text-gray-500 mt-4">{{ formatDate(sj.admin_signed_at) }}</p>
                </div>
                <div v-else class="h-24 flex items-center justify-center">
                  <span class="text-gray-400 text-sm font-bold">Tidak ada TTD</span>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <p class="text-sm font-black text-gray-800 mb-4 uppercase tracking-wider">Diterima Oleh (Supir)</p>
                <div v-if="sj.supir_signature">
                  <img :src="sj.supir_signature" class="mx-auto h-24 object-contain mix-blend-multiply" alt="TTD Supir" />
                  <p class="text-xs font-bold text-gray-500 mt-4">{{ formatDate(sj.supir_signed_at) }}</p>
                </div>
                <div v-else class="h-24 flex items-center justify-center">
                  <span class="text-gray-400 text-sm font-bold">Menunggu TTD</span>
                </div>
              </div>
            </div>

            <!-- Bukti Pengiriman -->
            <div v-if="sj.status === 'SELESAI'" class="mt-10 border-t-2 border-gray-200 pt-8">
              <h3 class="text-lg font-black text-gray-900 mb-6">Bukti Pengiriman</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <img v-if="sj.bukti_foto_url" :src="sj.bukti_foto_url" crossorigin="anonymous" class="rounded-xl border-2 border-gray-900 shadow-neo w-full h-auto max-h-64 object-cover" alt="Bukti Foto" />
                </div>
                <div class="flex flex-col justify-center">
                  <dl class="space-y-5 bg-green-50 p-6 rounded-xl border-2 border-green-600 shadow-neo">
                    <div>
                      <dt class="text-xs font-bold text-green-700 uppercase tracking-wider">Waktu Pengiriman</dt>
                      <dd class="text-base font-black text-green-900 mt-1">{{ formatDate(sj.bukti_at) }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-bold text-green-700 uppercase tracking-wider">Lokasi GPS</dt>
                      <dd class="font-mono text-sm font-bold text-green-900 mt-1">{{ sj.bukti_latitude }}, {{ sj.bukti_longitude }}</dd>
                      <dd class="mt-3">
                        <a :href="`https://www.google.com/maps/search/?api=1&query=${sj.bukti_latitude},${sj.bukti_longitude}`" target="_blank" class="inline-flex items-center px-4 py-2 border-2 border-green-800 rounded-lg text-sm font-bold text-green-900 bg-white hover:bg-green-100 transition-colors shadow-[2px_2px_0_rgb(21,128,61)] active:translate-y-0.5 active:shadow-none">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          Buka di Google Maps
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Hidden PDF Template -->
      <div class="fixed top-[200vh] left-0 w-[800px] bg-white text-black p-10 font-sans" id="pdf-template">
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
            <div v-if="sj.admin_signature" class="h-32 flex items-center justify-center">
              <img :src="sj.admin_signature" class="h-full object-contain" />
            </div>
            <div v-else class="h-32 border-b-2 border-dashed border-gray-400 mx-8"></div>
            <p class="font-bold text-gray-900 mt-2">Admin</p>
            <p class="text-xs text-gray-500 font-medium">{{ formatDate(sj.admin_signed_at) || '-' }}</p>
          </div>
          
          <div>
            <p class="text-sm font-bold text-gray-900 mb-6">Diterima Oleh</p>
            <div v-if="sj.supir_signature" class="h-32 flex items-center justify-center">
              <img :src="sj.supir_signature" class="h-full object-contain" />
            </div>
            <div v-else class="h-32 border-b-2 border-dashed border-gray-400 mx-8"></div>
            <p class="font-bold text-gray-900 mt-2">Supir ({{ supirName || '____' }})</p>
            <p class="text-xs text-gray-500 font-medium">{{ formatDate(sj.supir_signed_at) || '-' }}</p>
          </div>
        </div>

        <div v-if="sj.status === 'SELESAI'" class="pt-8 border-t-2 border-gray-300">
          <h3 class="text-lg font-black uppercase tracking-wider mb-6">Lampiran Bukti Pengiriman</h3>
          <div class="flex gap-8 items-center">
            <img v-if="sj.bukti_foto_url" :src="sj.bukti_foto_url" crossorigin="anonymous" class="w-48 h-48 object-cover rounded-xl border-2 border-gray-900 shadow-neo" />
            <div class="flex-1">
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">Status Akhir</p>
              <p class="text-lg font-black text-green-600 mb-4">SELESAI</p>
              
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">Waktu Sampai</p>
              <p class="text-base font-bold text-gray-900 mb-4">{{ formatDate(sj.bukti_at) }}</p>
              
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">Koordinat GPS</p>
              <p class="font-mono text-sm font-bold text-gray-900">{{ sj.bukti_latitude }}, {{ sj.bukti_longitude }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <div v-else-if="!loading" class="text-center py-12">
      <h3 class="text-lg font-bold text-gray-900">Data tidak ditemukan</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { useToast } from '@/composables/useToast'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

const route = useRoute()
const sj = ref(null)
const loading = ref(true)
const supirName = ref('')
const exportingPdf = ref(false)
const exportingExcel = ref(false)
const { showToast } = useToast()

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
      const { data: supirData } = await supabase.from('users').select('name, email').eq('id', data.supir_id).single()
      if (supirData) supirName.value = supirData.name || supirData.email
    }
  } catch (err) {
    console.error(err)
    showToast('Gagal memuat detail', 'error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

const exportPdf = async () => {
  const element = document.getElementById('pdf-template')
  if (!element) return
  
  try {
    exportingPdf.value = true
    const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    const imgData = canvas.toDataURL('image/jpeg', 0.8)
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${sj.value.nomor_dokumen}.pdf`)
    showToast('Berhasil mengunduh PDF', 'success')
  } catch (err) {
    console.error('PDF Export Error:', err)
    showToast(`Gagal mengekspor PDF: ${err.message || err}`, 'error')
  } finally {
    exportingPdf.value = false
  }
}

const exportExcel = () => {
  try {
    exportingExcel.value = true
    const dataToExport = [{
      'Nomor Dokumen': sj.value.nomor_dokumen,
      'Status': sj.value.status,
      'Tanggal Pengiriman': sj.value.tanggal_pengiriman,
      'Customer': sj.value.customer,
      'Data Barang': sj.value.data_barang,
      'Supir': supirName.value,
      'Waktu TTD Admin': sj.value.admin_signed_at ? formatDate(sj.value.admin_signed_at) : '-',
      'Waktu TTD Supir': sj.value.supir_signed_at ? formatDate(sj.value.supir_signed_at) : '-',
      'Waktu Selesai': sj.value.bukti_at ? formatDate(sj.value.bukti_at) : '-',
      'Lokasi GPS (Lat, Lng)': sj.value.bukti_latitude ? `${sj.value.bukti_latitude}, ${sj.value.bukti_longitude}` : '-'
    }]
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Surat Jalan')
    XLSX.writeFile(workbook, `${sj.value.nomor_dokumen}.xlsx`)
    showToast('Berhasil mengunduh Excel', 'success')
  } catch (err) {
    console.error('Excel Export Error:', err)
    showToast('Gagal mengekspor Excel.', 'error')
  } finally {
    exportingExcel.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>