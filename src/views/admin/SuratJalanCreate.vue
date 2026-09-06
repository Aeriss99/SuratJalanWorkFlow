<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <AdminNavbar />
    
    <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Buat Surat Jalan</h1>
        <button @click="$router.back()" class="text-sm text-gray-600 hover:text-gray-900">
          Batal
        </button>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow sm:rounded-lg">
          <form @submit.prevent="submitForm" class="space-y-6 p-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nomor Dokumen</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input type="text" v-model="form.nomor_dokumen" required
                  class="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contoh: SJ-2023-001" />
                <button type="button" @click="generateNomor"
                  class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors">
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Pengiriman</label>
              <input type="date" v-model="form.tanggal_pengiriman" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Customer</label>
              <input type="text" v-model="form.customer" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Data Barang</label>
              <textarea v-model="form.data_barang" rows="4" required
                placeholder="1. Barang A (2 pcs)&#10;2. Barang B (5 pcs)"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Tugaskan Supir</label>
              <select v-model="form.supir_id" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option :value="null">-- Pilih Supir --</option>
                <option v-for="supir in supirList" :key="supir.id" :value="supir.id">
                  {{ supir.name || supir.email }}
                </option>
              </select>
            </div>

            <div class="border-t border-gray-200 pt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanda Tangan Admin</label>
              <p class="text-xs text-gray-500 mb-3">Tanda tangani dokumen ini sebelum diserahkan ke Supir.</p>
              
              <div class="border-2 border-dashed border-gray-300 w-full h-40 bg-gray-50 rounded-md relative overflow-hidden">
                <VueSignaturePad width="100%" height="100%" ref="signaturePad" />
                <button type="button" @click="$refs.signaturePad.clearSignature()" class="absolute top-2 right-2 text-xs text-gray-600 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded shadow-sm transition-colors z-10">
                  Hapus
                </button>
              </div>
            </div>

            <div class="pt-5 border-t border-gray-200 flex justify-end">
              <button type="submit" :disabled="loading"
                class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
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
import AdminNavbar from '@/components/AdminNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const signaturePad = ref(null)

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
    alert('Harap berikan tanda tangan Admin sebelum menyimpan.')
    return
  }

  if (!form.supir_id) {
    alert('Harap pilih Supir untuk ditugaskan.')
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
    alert('Surat Jalan berhasil dibuat dan diserahkan ke Supir!')
    router.push(`/admin/surat-jalan/${data.id}`)
  } catch (err) {
    console.error(err)
    alert(err.message || 'Gagal menyimpan Surat Jalan')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSupir()
})
</script>