import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isInitialized = ref(false)

  async function initialize() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
    }
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        user.value = session.user
      } else {
        user.value = null
      }
    })
    
    isInitialized.value = true
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL
      }
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return {
    user,
    isInitialized,
    initialize,
    signInWithGoogle,
    signOut
  }
})
