<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center mb-4">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Buat Surat Jalan</h1>
        <button @click="$router.push('/')" class="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          Batal
        </button>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl p-6 sm:p-8">
          <form @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Nomor Dokumen</label>
              <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input type="text" v-model="form.nomor_dokumen" required placeholder="Ketik nomor atau klik Generate"
                  class="block w-full px-4 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-bold transition-colors" />
                <button type="button" @click="generateNomor"
                  class="w-full sm:w-auto px-4 py-3 border-2 border-gray-900 text-sm font-bold rounded-xl text-gray-900 bg-white hover:bg-gray-50 shadow-neo active:translate-y-0.5 active:shadow-none transition-all">
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Tanggal Pengiriman</label>
              <input type="date" v-model="form.tanggal_pengiriman" required
                class="block w-full px-4 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-bold transition-colors" />
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

            <div class="pt-6">
              <button type="submit" :disabled="loading"
                class="w-full bg-blue-500 border-2 border-gray-900 text-gray-900 font-black py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-base">
                BUAT & MULAI PENGIRIMAN
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const loading = ref(false)

const form = reactive({
  nomor_dokumen: '',
  tanggal_pengiriman: new Date().toISOString().split('T')[0],
  customer: '',
  data_barang: ''
})

const generateNomor = () => {
  const timestamp = new Date().getTime().toString().slice(-6)
  form.nomor_dokumen = `SJ-${new Date().getFullYear()}-${timestamp}`
}

const submitForm = async () => {
  if (!form.nomor_dokumen) {
    showToast('Harap isi nomor dokumen', 'error')
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
        admin_id: authStore.user.id,
        supir_id: authStore.user.id,
        status: 'ON_DELIVERY'
      })
      .select()
      .single()

    if (error) throw error
    
    // Manual audit trail insert
    await supabase.from('sj_history').insert({
      sj_id: data.id,
      actor_id: authStore.user.id,
      action: 'CREATED_AND_STARTED',
      status_after: 'ON_DELIVERY',
      reason: 'Dibuat dan langsung dijalankan'
    })

    showToast('Berhasil membuat surat jalan!', 'success')
    router.push(`/pengiriman-saya`)
  } catch (err) {
    if (err.code === '23505') {
      showToast('Nomor dokumen sudah digunakan. Silakan gunakan nomor lain.', 'error')
    } else {
      showToast(err.message || 'Terjadi kesalahan', 'error')
    }
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  generateNomor()
})
</script>
