import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userRole = ref(null)
  const isInitialized = ref(false)

  async function fetchUserRole(userId) {
    if (!userId) return null
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
      
    if (error) {
      if (error.code === 'PGRST116') {
        return 'PENDING'
      }
      console.error('Error fetching role:', error)
      return null
    }
    return data?.role || 'PENDING'
  }

  async function initialize() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      userRole.value = await fetchUserRole(session.user.id)
    }
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        user.value = session.user
        userRole.value = await fetchUserRole(session.user.id)
      } else {
        user.value = null
        userRole.value = null
      }
    })
    
    isInitialized.value = true
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    userRole.value = null
  }

  return {
    user,
    userRole,
    isInitialized,
    initialize,
    signInWithGoogle,
    signOut
  }
})