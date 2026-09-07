<template>
  <div class="min-h-screen bg-gray-50 pb-12">
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
          <form @submit.prevent="submitForm('SUBMITTED')" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Nomor Dokumen</label>
              <div class="flex gap-4">
                <input type="text" v-model="form.nomor_dokumen" required disabled
                  class="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 sm:text-sm font-bold text-gray-500" />
                <button type="button" @click="generateNomor"
                  class="px-4 py-2 border-2 border-gray-900 text-sm font-bold rounded-xl text-gray-900 bg-white hover:bg-gray-50 shadow-[2px_2px_0_rgb(0,0,0)] active:translate-y-0.5 active:shadow-none transition-all">
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

            <div class="pt-6 flex gap-4">
              <button type="button" @click="submitForm('DRAFT')" :disabled="loading"
                class="flex-1 bg-white border-2 border-gray-900 text-gray-900 font-black py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-base">
                SIMPAN DRAFT
              </button>
              <button type="submit" :disabled="loading"
                class="flex-1 bg-blue-500 border-2 border-gray-900 text-gray-900 font-black py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-base">
                SUBMIT
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

const submitForm = async (status) => {
  if (!form.nomor_dokumen) {
    showToast('Harap generate nomor dokumen', 'error')
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
        status: status
      })
      .select()
      .single()

    if (error) throw error
    
    // Manual audit trail insert
    await supabase.from('sj_history').insert({
      sj_id: data.id,
      actor_id: authStore.user.id,
      action: status === 'DRAFT' ? 'CREATED_DRAFT' : 'SUBMITTED',
      status_after: status
    })

    showToast(`Berhasil ${status === 'DRAFT' ? 'menyimpan draft' : 'submit surat jalan'}!`, 'success')
    router.push(`/surat-jalan/${data.id}`)
  } catch (err) {
    showToast(err.message || 'Terjadi kesalahan', 'error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  generateNomor()
})
</script>
