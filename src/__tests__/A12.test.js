import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '@/views/Dashboard.vue'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

vi.mock('@/components/Navbar.vue', () => ({
  default: {
    template: '<div>Navbar</div>'
  }
}))

describe('A.12 Revert Kebocoran Informasi Error Mentah', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()
  })

  it('hanya menampilkan pesan "Gagal memuat data" tanpa detail error', async () => {
    const errorMsg = 'relation "public.surat_jalan" does not exist'
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockRejectedValue(new Error(errorMsg))
    }))
    
    // spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mount(Dashboard, { global: { stubs: ['router-link', 'Teleport'] } })
    
    // wait for fetch to complete
    await new Promise(r => setTimeout(r, 0))

    // Assert that console.error was called with the actual error
    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0].message).toBe(errorMsg)
    
    // Assert that alert was called ONLY with 'Gagal memuat data'
    expect(window.alert).toHaveBeenCalledWith('Gagal memuat data')

    consoleSpy.mockRestore()
  })
})
