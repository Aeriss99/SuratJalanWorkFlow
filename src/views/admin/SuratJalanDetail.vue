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
          <button @click="exportPdf" class="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Export PDF
          </button>
          <button @click="exportExcel" class="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
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
                    <dd class="mt-1 text-sm font-semibold text-gray-900">{{ sj.status }}</dd>
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
                <div class="mt-4 text-sm text-gray-900 whitespace-pre-wrap">{{ sj.data_barang }}</div>
              </div>
            </div>

            <!-- Tanda Tangan Section -->
            <div class="mt-10 border-t border-gray-200 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
              <div>
                <p class="text-sm font-medium text-gray-700 mb-4">Dibuat Oleh (Admin)</p>
                <div v-if="sj.admin_signature">
                  <img :src="sj.admin_signature" class="mx-auto h-32 object-contain" alt="TTD Admin" />
                  <p class="text-xs text-gray-500 mt-2">Ditandatangani pada: {{ formatDate(sj.admin_signed_at) }}</p>
                </div>
                <div v-else class="flex flex-col items-center">
                  <div class="border-2 border-dashed border-gray-300 w-full max-w-xs h-32 bg-gray-50 rounded-md">
                    <VueSignaturePad width="100%" height="100%" ref="signaturePad" />
                  </div>
                  <div class="mt-2 flex gap-2">
                    <button @click="clearSignature" class="text-xs text-gray-600 px-2 py-1 bg-gray-200 rounded">Hapus</button>
                    <button @click="saveSignature" class="text-xs text-white px-2 py-1 bg-blue-600 rounded">Simpan TTD & Serahkan</button>
                  </div>
                </div>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-700 mb-4">Diterima Oleh (Supir)</p>
                <div v-if="sj.supir_signature">
                  <img :src="sj.supir_signature" class="mx-auto h-32 object-contain" alt="TTD Supir" />
                  <p class="text-xs text-gray-500 mt-2">Ditandatangani pada: {{ formatDate(sj.supir_signed_at) }}</p>
                </div>
                <div v-else class="border-2 border-dashed border-gray-300 w-full max-w-xs h-32 mx-auto bg-gray-50 flex items-center justify-center">
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
                  <dl class="space-y-4 text-sm text-gray-700">
                    <div>
                      <dt class="font-medium text-gray-500">Waktu Pengiriman</dt>
                      <dd>{{ formatDate(sj.bukti_waktu) }}</dd>
                    </div>
                    <div>
                      <dt class="font-medium text-gray-500">Lokasi GPS</dt>
                      <dd>{{ sj.bukti_latitude }}, {{ sj.bukti_longitude }}</dd>
                      <dd class="mt-1">
                        <a :href="`https://www.google.com/maps/search/?api=1&query=${sj.bukti_latitude},${sj.bukti_longitude}`" target="_blank" class="text-blue-600 hover:underline">
                          Lihat di Maps
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
    <div v-else-if="!loading" class="text-center py-12">Data tidak ditemukan</div>
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
const signaturePad = ref(null)

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

const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clearSignature()
  }
}

const saveSignature = async () => {
  if (!signaturePad.value) return
  const { isEmpty, data } = signaturePad.value.saveSignature()
  if (isEmpty) {
    alert('Harap berikan tanda tangan')
    return
  }
  
  if (!sj.value.supir_id) {
    alert('Pilih supir terlebih dahulu sebelum menyerahkan (edit belum didukung di UI demo ini, asumsikan sudah ada supir saat buat)')
    return
  }

  try {
    const { error } = await supabase
      .from('surat_jalan')
      .update({
        admin_signature: data,
        admin_signed_at: new Date().toISOString(),
        status: 'MENUNGGU SUPIR'
      })
      .eq('id', sj.value.id)
      
    if (error) throw error
    alert('Berhasil disimpan')
    await fetchDetail()
  } catch (err) {
    console.error(err)
    alert('Gagal menyimpan TTD')
  }
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
    'Waktu Selesai': sj.value.bukti_waktu ? formatDate(sj.value.bukti_waktu) : '-',
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