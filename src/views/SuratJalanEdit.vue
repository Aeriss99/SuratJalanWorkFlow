<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-12">
    <Navbar />
    
    <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0 flex justify-between items-center mb-4">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Edit Surat Jalan</h1>
        <button @click="$router.back()" class="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          Batal
        </button>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow-neo border-2 border-gray-900 sm:rounded-2xl p-6 sm:p-8">
          <form v-if="!loading" @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-2">Nomor Dokumen</label>
              <input type="text" v-model="form.nomor_dokumen" required disabled
                class="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 sm:text-sm font-bold text-gray-500" />
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
                class="block w-full px-4 py-3 rounded-xl border-2 border-gray-900 focus:ring-0 focus:border-blue-600 sm:text-sm font-medium transition-colors resize-y"></textarea>
            </div>

            <div class="pt-6">
              <button type="submit" :disabled="submitting"
                class="w-full bg-blue-500 border-2 border-gray-900 text-gray-900 font-black py-4 rounded-xl shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-base">
                SIMPAN PERUBAHAN
              </button>
            </div>
          </form>
          <div v-else class="text-center py-12 text-gray-500 font-bold">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status"></div>
            <p>Memuat data...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showToast } = useToast()

const loading = ref(true)
const submitting = ref(false)

const form = reactive({
  nomor_dokumen: '',
  tanggal_pengiriman: '',
  customer: '',
  data_barang: ''
})

const fetchDetail = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('*')
      .eq('id', route.params.id)
      .single()
      
    if (error) throw error
    
    if (!['DRAFT', 'MENUNGGU REVIEW', 'DITOLAK'].includes(data.status)) {
      showToast('Dokumen tidak dapat diedit pada status ini', 'error')
      router.push(`/surat-jalan/${data.id}`)
      return
    }

    form.nomor_dokumen = data.nomor_dokumen
    form.tanggal_pengiriman = data.tanggal_pengiriman
    form.customer = data.customer
    form.data_barang = data.data_barang

  } catch (err) {
    showToast('Gagal memuat detail', 'error')
    router.back()
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  try {
    submitting.value = true
    const { error } = await supabase
      .from('surat_jalan')
      .update({
        tanggal_pengiriman: form.tanggal_pengiriman,
        customer: form.customer,
        data_barang: form.data_barang,
      })
      .eq('id', route.params.id)

    if (error) throw error
    
    // Manual audit trail insert for EDIT
    await supabase.from('sj_history').insert({
      sj_id: route.params.id,
      actor_id: authStore.user.id,
      action: 'EDITED_DOCUMENT',
      reason: 'Dokumen diubah oleh pengguna'
    })

    showToast('Berhasil menyimpan perubahan!', 'success')
    router.push(`/surat-jalan/${route.params.id}`)
  } catch (err) {
    showToast(err.message || 'Terjadi kesalahan', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>
