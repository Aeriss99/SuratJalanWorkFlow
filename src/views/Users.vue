<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0">
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Kelola User</h1>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="space-y-4">
          <div v-for="user in users" :key="user.id" class="bg-white rounded-2xl shadow-neo border-2 border-gray-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-lg font-bold text-gray-900">{{ user.name || user.email }}</p>
              <p class="text-sm font-medium text-gray-500">{{ user.email }}</p>
            </div>
            <div class="flex items-center gap-4 relative w-full sm:w-auto">
              <select
                v-model="user.role"
                @change="updateRole(user.id, user.role)"
                class="block w-full sm:w-48 pl-4 pr-10 py-2.5 text-sm font-bold border-2 border-gray-900 bg-white focus:outline-none focus:ring-0 rounded-xl shadow-sm appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <option value="PENDING">PENDING</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPIR">SUPIR</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-900">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="px-4 py-12 text-center text-gray-500 font-bold">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status"></div>
            <p>Memuat users...</p>
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
import { useToast } from '@/composables/useToast'

const users = ref([])
const loading = ref(true)
const { showToast } = useToast()

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
    showToast('Gagal memuat users', 'error')
  } finally {
    loading.value = false
  }
}

const updateRole = async (userId, newRole) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      
    if (error) throw error
    showToast('Role berhasil diupdate', 'success')
  } catch (err) {
    console.error(err)
    showToast('Gagal update role', 'error')
    await fetchUsers()
  }
}

onMounted(() => {
  fetchUsers()
})
</script>