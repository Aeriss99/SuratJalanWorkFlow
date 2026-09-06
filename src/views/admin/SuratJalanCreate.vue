<template>
  <div class="min-h-screen bg-gray-50">
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
                  class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700">
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
              <label class="block text-sm font-medium text-gray-700">Tugaskan Supir (Opsional)</label>
              <select v-model="form.supir_id"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option :value="null">-- Pilih Supir --</option>
                <option v-for="supir in supirList" :key="supir.id" :value="supir.id">
                  {{ supir.name || supir.email }}
                </option>
              </select>
            </div>

            <div class="pt-5 border-t border-gray-200 flex justify-end">
              <button type="submit" :disabled="loading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {{ loading ? 'Menyimpan...' : 'Simpan Draft' }}
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
        status: form.supir_id ? 'MENUNGGU ADMIN' : 'DRAFT'
      })
      .select()
      .single()

    if (error) throw error
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