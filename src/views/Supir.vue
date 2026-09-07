<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <Navbar />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Daftar Anggota / Supir</h1>
        <p class="text-sm text-gray-500 font-bold mt-1">Daftar pengguna yang dapat ditugaskan untuk melakukan pengiriman.</p>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="space-y-4">
          <div v-for="user in users" :key="user.id" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-lg font-bold text-gray-900">{{ user.name || user.email }}</p>
              <p class="text-sm font-medium text-gray-500">{{ user.email }}</p>
            </div>
            <div class="px-3 py-1 bg-green-100 text-green-800 border-2 border-green-800 rounded-full text-xs font-bold">
              AKTIF
            </div>
          </div>
          
          <div v-if="loading" class="px-4 py-12 text-center text-gray-500 font-bold">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status"></div>
            <p>Memuat data...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar.vue'

const users = ref([])
const loading = ref(true)

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    users.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
