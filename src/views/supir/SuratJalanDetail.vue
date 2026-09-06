<template>
  <SupirNavbar title="Detail Tugas">
    <div v-if="sj" class="px-4 py-2 space-y-5 max-w-md mx-auto">
      
      <!-- Info Card -->
      <div class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-5">
        <div class="flex justify-between items-start mb-4 border-b-2 border-gray-100 pb-4">
          <div>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nomor Dokumen</span>
            <h2 class="font-black text-gray-900 text-xl tracking-tight">{{ sj.nomor_dokumen }}</h2>
          </div>
          <span class="text-xs font-black px-3 py-1 rounded-lg border-2 bg-gray-100 text-gray-800 border-gray-900">{{ sj.status }}</span>
        </div>
        
        <div class="space-y-4">
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Customer</p>
            <p class="text-gray-900 font-black text-lg">{{ sj.customer }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Tanggal Pengiriman</p>
            <p class="text-gray-900 font-bold">{{ sj.tanggal_pengiriman }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Data Barang</p>
            <p class="text-gray-900 font-medium whitespace-pre-wrap text-sm mt-1 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">{{ sj.data_barang }}</p>
          </div>
        </div>
      </div>

      <!-- Action: TTD & Terima -->
      <div v-if="sj.status === 'MENUNGGU SUPIR'" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-5">
        <h3 class="font-black text-gray-900 text-lg mb-2">Tanda Tangan & Terima</h3>
        <p class="text-sm text-gray-500 mb-4 font-medium">Tanda tangani di bawah ini untuk mengonfirmasi penerimaan tugas.</p>
        
        <div class="border-2 border-dashed border-gray-400 hover:border-blue-500 rounded-xl bg-gray-50 h-48 mb-5 relative overflow-hidden transition-colors">
          <VueSignaturePad width="100%" height="100%" ref="signaturePad" />
          <button @click="$refs.signaturePad.clearSignature()" class="absolute top-3 right-3 text-xs font-bold bg-white border-2 border-gray-900 text-gray-800 px-3 py-1.5 rounded-lg shadow-[2px_2px_0_rgb(0,0,0)] active:translate-y-0.5 active:shadow-none transition-all z-10">Hapus</button>
        </div>
        
        <button @click="terimaTugas" :disabled="submitting" class="w-full bg-blue-500 border-2 border-gray-900 text-gray-900 font-black py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-base uppercase tracking-wider flex justify-center items-center gap-2">
          <svg v-if="submitting" class="animate-spin h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ submitting ? 'Memproses...' : 'KONFIRMASI TERIMA' }}
        </button>
      </div>

      <!-- Action: Pesanan Sampai -->
      <div v-if="['DITERIMA SUPIR', 'DALAM PENGIRIMAN'].includes(sj.status)" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-5 space-y-5">
        <h3 class="font-black text-gray-900 text-lg text-center uppercase tracking-wider">Penyelesaian Tugas</h3>
        
        <div v-if="!fotoData" class="space-y-4">
          <div class="border-2 border-dashed border-gray-400 bg-gray-50 rounded-2xl p-10 text-center cursor-pointer hover:bg-gray-100 transition-colors active:scale-95" @click="$refs.cameraInput.click()">
            <svg class="w-12 h-12 text-gray-800 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <p class="text-gray-900 font-black">AMBIL FOTO BUKTI</p>
          </div>
          <input type="file" accept="image/*" capture="environment" ref="cameraInput" class="hidden" @change="handleFotoUpload" />
        </div>
        
        <div v-else class="space-y-5">
          <div class="relative">
            <img :src="fotoPreview" class="w-full h-64 object-cover rounded-xl border-2 border-gray-900 shadow-neo" />
            <button @click="fotoData = null; fotoPreview = null" class="absolute -top-3 -right-3 bg-red-500 border-2 border-gray-900 text-white p-2 rounded-full shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <button @click="selesaiTugas" :disabled="submitting" class="w-full bg-green-400 border-2 border-gray-900 text-gray-900 font-black py-4.5 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-lg uppercase tracking-wider flex justify-center items-center gap-2">
            <svg v-if="submitting" class="animate-spin h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ submitting ? 'Memproses...' : 'PESANAN SAMPAI' }}
          </button>
        </div>
      </div>
      
      <!-- Completed State -->
      <div v-if="sj.status === 'SELESAI'" class="bg-green-50 rounded-2xl border-2 border-green-600 shadow-neo p-8 text-center mt-6">
        <div class="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-700">
          <svg class="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 class="font-black text-xl text-green-900 tracking-tight">Tugas Selesai</h3>
        <p class="text-sm font-bold text-green-700 mt-2">Terima kasih atas kerja keras Anda.</p>
      </div>

    </div>
    <div v-else-if="!loading" class="text-center py-12 text-gray-500 font-bold">
      Tugas tidak ditemukan.
    </div>
  </SupirNavbar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import SupirNavbar from '@/components/SupirNavbar.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const sj = ref(null)
const loading = ref(true)
const submitting = ref(false)
const { showToast } = useToast()

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
    showToast('Gagal memuat tugas', 'error')
  } finally {
    loading.value = false
  }
}

const terimaTugas = async () => {
  if (!signaturePad.value) return
  const { isEmpty, data } = signaturePad.value.saveSignature()
  if (isEmpty) {
    showToast('Harap tanda tangan terlebih dahulu!', 'error')
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
    showToast('Tugas berhasil diterima!', 'success')
    await fetchDetail()
  } catch (err) {
    showToast('Gagal konfirmasi terima', 'error')
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
    showToast('Harap ambil foto bukti!', 'error')
    return
  }

  try {
    submitting.value = true
    
    // 1. Get GPS
    const gps = await getGPSLocation()
    
    // 2. Upload foto
    const fileExt = fotoData.value.name.split('.').pop()
    const fileName = `${sj.value.id}-${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bukti')
      .upload(fileName, fotoData.value)
      
    if (uploadError) {
      console.warn('Storage bucket "bukti" might not exist. Falling back to base64 for demo purposes.')
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
        bukti_at: new Date().toISOString()
      })
      .eq('id', sj.value.id)
      
    if (error) throw error
    showToast('Tugas Selesai!', 'success')
    await fetchDetail()
  } catch (err) {
    showToast(err.message || 'Terjadi kesalahan saat menyelesaikan tugas', 'error')
    console.error(err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>