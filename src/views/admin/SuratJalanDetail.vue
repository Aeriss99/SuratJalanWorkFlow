<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <AdminNavbar />
    
    <main v-if="sj" class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Detail Surat Jalan</h1>
          <p class="text-sm text-gray-500 mt-1">{{ sj.nomor_dokumen }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="exportPdf" class="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Export PDF
          </button>
          <button @click="exportExcel" class="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Export Excel
          </button>
        </div>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow sm:rounded-lg" id="print-area">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-medium leading-6 text-gray-900">Informasi Pengiriman</h3>
                <dl class="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Status</dt>
                    <dd class="mt-1 text-sm font-semibold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">{{ sj.status }}</dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Customer</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ sj.customer }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">Tanggal Pengiriman</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ sj.tanggal_pengiriman }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">Supir Ditugaskan</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ supirName || 'Belum dipilih' }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 class="text-lg font-medium leading-6 text-gray-900">Data Barang</h3>
                <div class="mt-4 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-100">{{ sj.data_barang }}</div>
              </div>
            </div>

            <!-- Tanda Tangan Section -->
            <div class="mt-10 border-t border-gray-200 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
              <div>
                <p class="text-sm font-medium text-gray-700 mb-4">Dibuat Oleh (Admin)</p>
                <div v-if="sj.admin_signature">
                  <img :src="sj.admin_signature" class="mx-auto h-32 object-contain" alt="TTD Admin" />
                  <p class="text-xs text-gray-500 mt-2">Ditandatangani pada: <br>{{ formatDate(sj.admin_signed_at) }}</p>
                </div>
                <div v-else class="border-2 border-dashed border-gray-300 w-full max-w-xs h-32 mx-auto bg-gray-50 flex items-center justify-center rounded-md">
                  <span class="text-gray-400 text-sm">Tidak ada TTD Admin</span>
                </div>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-700 mb-4">Diterima Oleh (Supir)</p>
                <div v-if="sj.supir_signature">
                  <img :src="sj.supir_signature" class="mx-auto h-32 object-contain" alt="TTD Supir" />
                  <p class="text-xs text-gray-500 mt-2">Ditandatangani pada: <br>{{ formatDate(sj.supir_signed_at) }}</p>
                </div>
                <div v-else class="border-2 border-dashed border-gray-300 w-full max-w-xs h-32 mx-auto bg-gray-50 flex items-center justify-center rounded-md">
                  <span class="text-gray-400 text-sm">Menunggu TTD Supir</span>
                </div>
              </div>
            </div>

            <!-- Bukti Pengiriman -->
            <div v-if="sj.status === 'SELESAI'" class="mt-10 border-t border-gray-200 pt-8">
              <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Bukti Pengiriman</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <img v-if="sj.bukti_foto_url" :src="sj.bukti_foto_url" class="rounded-lg shadow-sm max-w-full h-auto max-h-64 object-cover" alt="Bukti Foto" />
                </div>
                <div>
                  <dl class="space-y-4 text-sm text-gray-700 bg-green-50 p-4 rounded-md border border-green-100">
                    <div>
                      <dt class="font-medium text-gray-500">Waktu Pengiriman</dt>
                      <dd class="font-semibold">{{ formatDate(sj.bukti_at) }}</dd>
                    </div>
                    <div class="pt-2 border-t border-green-200">
                      <dt class="font-medium text-gray-500">Lokasi GPS</dt>
                      <dd class="font-mono text-xs mt-1">{{ sj.bukti_latitude }}, {{ sj.bukti_longitude }}</dd>
                      <dd class="mt-2">
                        <a :href="`https://www.google.com/maps/search/?api=1&query=${sj.bukti_latitude},${sj.bukti_longitude}`" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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
    </main>
    <div v-else-if="!loading" class="text-center py-12 text-gray-500">Data tidak ditemukan</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

const route = useRoute()
const sj = ref(null)
const loading = ref(true)
const supirName = ref('')

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
    alert('Gagal memuat detail')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID')
}

const exportPdf = async () => {
  const element = document.getElementById('print-area')
  if (!element) return
  
  const canvas = await html2canvas(element, { scale: 2 })
  const imgData = canvas.toDataURL('image/jpeg', 0.8)
  
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`${sj.value.nomor_dokumen}.pdf`)
}

const exportExcel = () => {
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
}

onMounted(() => {
  fetchDetail()
})
</script>