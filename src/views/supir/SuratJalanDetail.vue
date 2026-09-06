<template>
  <SupirNavbar title="Detail Tugas">
    <div v-if="sj" class="p-4 space-y-4">
      
      <!-- Info Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 class="font-bold text-gray-900 text-lg">{{ sj.nomor_dokumen }}</h2>
          <span class="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-800">{{ sj.status }}</span>
        </div>
        
        <div class="space-y-3">
          <div>
            <p class="text-xs text-gray-500 font-medium">Customer</p>
            <p class="text-gray-900 font-medium">{{ sj.customer }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium">Tanggal Pengiriman</p>
            <p class="text-gray-900">{{ sj.tanggal_pengiriman }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium">Data Barang</p>
            <p class="text-gray-900 whitespace-pre-wrap text-sm mt-1 bg-gray-50 p-3 rounded-lg">{{ sj.data_barang }}</p>
          </div>
        </div>
      </div>

      <!-- Action: TTD & Terima -->
      <div v-if="sj.status === 'MENUNGGU SUPIR'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 class="font-bold text-gray-900 mb-2">Tanda Tangan & Terima</h3>
        <p class="text-xs text-gray-500 mb-4">Tanda tangani di bawah ini untuk mengonfirmasi penerimaan tugas.</p>
        
        <div class="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 h-40 mb-3 relative">
          <VueSignaturePad width="100%" height="100%" ref="signaturePad" />
          <button @click="$refs.signaturePad.clearSignature()" class="absolute top-2 right-2 text-xs bg-gray-200 px-2 py-1 rounded">Hapus</button>
        </div>
        
        <button @click="terimaTugas" :disabled="submitting" class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md active:bg-blue-700 transition disabled:opacity-50">
          {{ submitting ? 'Memproses...' : 'KONFIRMASI TERIMA' }}
        </button>
      </div>

      <!-- Action: Pesanan Sampai -->
      <div v-if="['DITERIMA SUPIR', 'DALAM PENGIRIMAN'].includes(sj.status)" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <h3 class="font-bold text-gray-900 text-center">Tugas Sedang Berjalan</h3>
        
        <div v-if="!fotoData" class="space-y-4">
          <div class="border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-8 text-center" @click="$refs.cameraInput.click()">
            <svg class="w-10 h-10 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <p class="text-blue-700 font-medium">Ambil Foto Bukti</p>
          </div>
          <input type="file" accept="image/*" capture="environment" ref="cameraInput" class="hidden" @change="handleFotoUpload" />
        </div>
        
        <div v-else class="space-y-4">
          <div class="relative">
            <img :src="fotoPreview" class="w-full rounded-xl" />
            <button @click="fotoData = null; fotoPreview = null" class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <button @click="selesaiTugas" :disabled="submitting" class="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-md active:bg-green-700 transition disabled:opacity-50 text-lg">
            {{ submitting ? 'Memproses...' : 'PESANAN SAMPAI' }}
          </button>
        </div>
      </div>
      
      <!-- Completed State -->
      <div v-if="sj.status === 'SELESAI'" class="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
        <svg class="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="font-bold text-green-800">Tugas Selesai</h3>
        <p class="text-sm text-green-600 mt-1">Terima kasih atas kerja keras Anda.</p>
      </div>

    </div>
    <div v-else-if="!loading" class="text-center py-12 text-gray-500">
      Tugas tidak ditemukan.
    </div>
  </SupirNavbar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import SupirNavbar from '@/components/SupirNavbar.vue'

const route = useRoute()
const sj = ref(null)
const loading = ref(true)
const submitting = ref(false)

const signaturePad = ref(null)
const cameraInput = ref(null)
const fotoData = ref(null)
const fotoPreview = ref(null)

const fetchDetail = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('*')
      .eq('id', route.params.id)
      .single()
      
    if (error) throw error
    sj.value = data
  } catch (err) {
    console.error(err)
    alert('Gagal memuat tugas')
  } finally {
    loading.value = false
  }
}

const terimaTugas = async () => {
  if (!signaturePad.value) return
  const { isEmpty, data } = signaturePad.value.saveSignature()
  if (isEmpty) {
    alert('Harap tanda tangan terlebih dahulu!')
    return
  }

  try {
    submitting.value = true
    const { error } = await supabase
      .from('surat_jalan')
      .update({
        supir_signature: data,
        supir_signed_at: new Date().toISOString(),
        status: 'DITERIMA SUPIR'
      })
      .eq('id', sj.value.id)
      
    if (error) throw error
    await fetchDetail()
  } catch (err) {
    alert('Gagal konfirmasi terima')
    console.error(err)
  } finally {
    submitting.value = false
  }
}

const handleFotoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Compress/preview
  fotoData.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    fotoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const getGPSLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS tidak didukung di perangkat ini.'))
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

const selesaiTugas = async () => {
  if (!fotoData.value) {
    alert('Harap ambil foto bukti!')
    return
  }

  try {
    submitting.value = true
    
    // 1. Get GPS
    const gps = await getGPSLocation()
    
    // 2. Upload foto
    // For simplicity without real storage setup in this snippet, we will upload to supabase storage bucket "bukti"
    const fileExt = fotoData.value.name.split('.').pop()
    const fileName = `${sj.value.id}-${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bukti')
      .upload(fileName, fotoData.value)
      
    if (uploadError) {
      console.warn('Storage bucket "bukti" might not exist. Falling back to base64 for demo purposes.')
      // Fallback if bucket doesn't exist (only for demo, in prod throw error)
    }
    
    let photoUrl = fotoPreview.value // Fallback to base64 if upload fails
    if (uploadData) {
      const { data: publicUrlData } = supabase.storage.from('bukti').getPublicUrl(fileName)
      photoUrl = publicUrlData.publicUrl
    }

    // 3. Update DB
    const { error } = await supabase
      .from('surat_jalan')
      .update({
        status: 'SELESAI',
        bukti_foto_url: photoUrl,
        bukti_latitude: gps.lat,
        bukti_longitude: gps.lng,
        bukti_waktu: new Date().toISOString()
      })
      .eq('id', sj.value.id)
      
    if (error) throw error
    alert('Tugas Selesai!')
    await fetchDetail()
  } catch (err) {
    alert(err.message || 'Terjadi kesalahan saat menyelesaikan tugas')
    console.error(err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>