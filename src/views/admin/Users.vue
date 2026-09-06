<template>
  <div class="min-h-screen bg-gray-50">
    <AdminNavbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0">
        <h1 class="text-2xl font-semibold text-gray-900">Kelola User</h1>
      </div>

      <div class="mt-4 px-4 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="user in users" :key="user.id" class="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.name || user.email }}</p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              <div class="flex items-center gap-4">
                <select
                  v-model="user.role"
                  @change="updateRole(user.id, user.role)"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPIR">SUPIR</option>
                </select>
              </div>
            </li>
            <li v-if="loading" class="px-4 py-4 text-center">Memuat...</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar.vue'

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
    alert('Gagal memuat users')
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
    alert('Role berhasil diupdate')
  } catch (err) {
    console.error(err)
    alert('Gagal update role')
    await fetchUsers()
  }
}

onMounted(() => {
  fetchUsers()
})
</script>