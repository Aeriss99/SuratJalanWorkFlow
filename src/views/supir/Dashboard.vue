<template>
  <SupirNavbar title="Tugas Saya">
    <div class="p-4 space-y-4">
      <div v-if="loading" class="text-center py-8 text-gray-500">
        Memuat tugas...
      </div>
      
      <div v-else-if="tasks.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        <p class="mt-4 text-gray-500">Belum ada tugas saat ini</p>
      </div>

      <router-link 
        v-for="task in tasks" :key="task.id"
        :to="`/supir/surat-jalan/${task.id}`"
        class="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden active:bg-gray-50"
      >
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-gray-900">{{ task.nomor_dokumen }}</h3>
            <span class="text-xs font-bold px-2 py-1 rounded" :class="statusStyle(task.status)">
              {{ task.status }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-1">
            <span class="font-medium">Customer:</span> {{ task.customer }}
          </p>
          <p class="text-sm text-gray-600">
            <span class="font-medium">Tgl:</span> {{ task.tanggal_pengiriman }}
          </p>
        </div>
        <div class="bg-gray-50 px-4 py-2 border-t border-gray-100 text-sm text-blue-600 font-medium text-center">
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
  if (status === 'SELESAI') return 'bg-green-100 text-green-700'
  if (status === 'DALAM PENGIRIMAN') return 'bg-purple-100 text-purple-700'
  if (status === 'DITERIMA SUPIR') return 'bg-blue-100 text-blue-700'
  return 'bg-orange-100 text-orange-700'
}

onMounted(() => {
  fetchTasks()
})
</script>