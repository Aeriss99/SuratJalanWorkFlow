<template>
  <SupirNavbar title="Tugas Saya">
    <div class="px-4 space-y-4 max-w-md mx-auto">
      <div v-if="loading" class="text-center py-12 text-gray-500 font-bold">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status"></div>
        <p>Memuat tugas...</p>
      </div>
      
      <div v-else-if="tasks.length === 0" class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        <p class="mt-4 text-gray-500 font-bold">Belum ada tugas saat ini</p>
      </div>

      <router-link 
        v-for="task in tasks" :key="task.id"
        :to="`/supir/surat-jalan/${task.id}`"
        class="block bg-white rounded-2xl shadow-neo border-2 border-gray-900 overflow-hidden active:translate-y-0.5 active:shadow-none transition-all"
      >
        <div class="p-5">
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-black text-xl text-gray-900 tracking-tight">{{ task.nomor_dokumen }}</h3>
            <span class="text-xs font-bold px-2.5 py-1 rounded-lg border-2" :class="statusStyle(task.status)">
              {{ task.status }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-1">
            <span class="font-bold text-gray-800">Customer:</span> {{ task.customer }}
          </p>
          <p class="text-sm text-gray-600">
            <span class="font-bold text-gray-800">Tgl:</span> {{ task.tanggal_pengiriman }}
          </p>
        </div>
        <div class="bg-blue-50 px-5 py-3 border-t-2 border-gray-900 text-sm text-blue-800 font-black text-center uppercase tracking-wider">
          Buka Detail &rarr;
        </div>
      </router-link>
    </div>
  </SupirNavbar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import SupirNavbar from '@/components/SupirNavbar.vue'

const authStore = useAuthStore()
const tasks = ref([])
const loading = ref(true)

const fetchTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('surat_jalan')
      .select('id, nomor_dokumen, customer, tanggal_pengiriman, status')
      .eq('supir_id', authStore.user.id)
      .in('status', ['MENUNGGU SUPIR', 'DITERIMA SUPIR', 'DALAM PENGIRIMAN', 'SELESAI'])
      .order('created_at', { ascending: false })
      
    if (error) throw error
    tasks.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const statusStyle = (status) => {
  if (status === 'SELESAI') return 'bg-green-100 text-green-900 border-green-900'
  if (status === 'DALAM PENGIRIMAN') return 'bg-purple-100 text-purple-900 border-purple-900'
  if (status === 'DITERIMA SUPIR') return 'bg-blue-100 text-blue-900 border-blue-900'
  return 'bg-orange-100 text-orange-900 border-orange-900'
}

onMounted(() => {
  fetchTasks()
})
</script>