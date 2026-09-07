<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <Navbar />
    
    <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Buat Surat Jalan</h1>
        <button @click="$router.back()" class="text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border-2 border-transparent hover:border-gray-900 px-4 py-2 rounded-xl transition-all">
          Batal
        </button>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl">
          <form @submit.prevent="submitForm" class="space-y-6 p-6 sm:p-8">
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Nomor Dokumen</label>
              <div class="flex gap-3">
                <input type="text" v-model="form.nomor_dokumen" required
                  class="flex-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-medium transition-colors"
                  placeholder="Contoh: SJ-2023-001" />
                <button type="button" @click="generateNomor"
                  class="inline-flex justify-center items-center py-3 px-6 border-2 border-gray-900 shadow-neo text-sm font-bold rounded-xl text-gray-900 bg-gray-100 hover:bg-gray-200 active:translate-y-0.5 active:shadow-none transition-all">
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Tanggal Pengiriman</label>
              <input type="date" v-model="form.tanggal_pengiriman" required
                class="block w-full px-4 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-medium transition-colors" />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Customer</label>
              <input type="text" v-model="form.customer" required
                class="block w-full px-4 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-medium transition-colors" />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Data Barang</label>
              <textarea v-model="form.data_barang" rows="4" required
                placeholder="1. Barang A (2 pcs)&#10;2. Barang B (5 pcs)"
                class="block w-full px-4 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-medium transition-colors resize-y"></textarea>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Tugaskan Supir</label>
              <div class="relative">
                <select v-model="form.supir_id" required
                  class="block w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-bold transition-colors appearance-none bg-white">
                  <option :value="null">-- Pilih Supir --</option>
                  <option v-for="supir in supirList" :key="supir.id" :value="supir.id">
                    {{ supir.name || supir.email }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-900">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div class="border-t-2 border-gray-200 pt-6">
              <label class="block text-base font-bold text-gray-900 mb-1">Tanda Tangan Admin</label>
              <p class="text-sm text-gray-500 mb-4 font-medium">Tanda tangani dokumen ini sebelum diserahkan ke Supir.</p>
              
              <div class="border-2 border-dashed border-gray-400 hover:border-blue-500 w-full h-48 bg-gray-50 rounded-2xl relative overflow-hidden transition-colors cursor-crosshair">
                <VueSignaturePad width="100%" height="100%" ref="signaturePad" />
                <button type="button" @click="$refs.signaturePad.clearSignature()" class="absolute top-3 right-3 text-xs font-bold text-gray-700 bg-white border-2 border-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg shadow-[2px_2px_0_rgb(0,0,0)] active:translate-y-0.5 active:shadow-none transition-all z-10">
                  Hapus
                </button>
              </div>
            </div>

            <div class="pt-8 flex justify-end">
              <button type="submit" :disabled="loading"
                class="w-full sm:w-auto inline-flex justify-center items-center py-3.5 px-8 border-2 border-gray-900 shadow-neo text-base font-bold rounded-xl text-gray-900 bg-blue-400 hover:bg-blue-500 active:translate-y-0.5 active:shadow-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ loading ? 'Memproses...' : 'Simpan & Tugaskan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const signaturePad = ref(null)
const { showToast } = useToast()

const loading = ref(false)
const supirList = ref([])

const form = reactive({
  nomor_dokumen: '',
  tanggal_pengiriman: new Date().toISOString().split('T')[0],
  customer: '',
  data_barang: '',
  supir_id: null
})

const fetchSupir = async () => {
  const { data } = await supabase.from('users').select('*').eq('role', 'SUPIR')
  if (data) supirList.value = data
}

const generateNomor = () => {
  const timestamp = new Date().getTime().toString().slice(-6)
  form.nomor_dokumen = `SJ-${new Date().getFullYear()}-${timestamp}`
}

const submitForm = async () => {
  if (!signaturePad.value) return
  
  const { isEmpty, data: signatureData } = signaturePad.value.saveSignature()
  if (isEmpty) {
    showToast('Harap berikan tanda tangan Admin sebelum menyimpan.', 'error')
    return
  }

  if (!form.supir_id) {
    showToast('Harap pilih Supir untuk ditugaskan.', 'error')
    return
  }

  try {
    loading.value = true
    const { data, error } = await supabase
      .from('surat_jalan')
      .insert({
        nomor_dokumen: form.nomor_dokumen,
        tanggal_pengiriman: form.tanggal_pengiriman,
        customer: form.customer,
        data_barang: form.data_barang,
        supir_id: form.supir_id,
        admin_id: authStore.user.id,
        status: 'MENUNGGU SUPIR', // Langsung masuk ke HP Supir
        admin_signature: signatureData,
        admin_signed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    showToast('Surat Jalan berhasil dibuat dan diserahkan ke Supir!', 'success')
    router.push(`/surat-jalan/${data.id}`)
  } catch (err) {
    console.error(err)
    showToast(err.message || 'Gagal menyimpan Surat Jalan', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSupir()
})
</script>