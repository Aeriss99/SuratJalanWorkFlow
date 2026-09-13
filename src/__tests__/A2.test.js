import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '@/views/Dashboard.vue'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => ({
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 1, status: 'DRAFT', created_at: new Date().toISOString() },
              { id: 2, status: 'ON_DELIVERY', created_at: new Date().toISOString() },
              { id: 3, status: 'COMPLETED', created_at: new Date().toISOString() },
              { id: 4, status: 'CANCELLED', created_at: new Date().toISOString() },
              { id: 5, status: 'DELETED', created_at: new Date().toISOString() }
            ],
            error: null
          })
        })
      })
    })
  }
}))

vi.mock('@/components/Navbar.vue', () => ({
  default: {
    template: '<div>Navbar</div>'
  }
}))

describe('A.2 Kategori Semua Aktif', () => {
  it('total count semua aktif = draft + berjalan + selesai (tanpa batal/deleted)', async () => {
    const wrapper = mount(Dashboard, {
      global: {
        stubs: ['router-link']
      }
    })
    
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    
    const countSemua = wrapper.vm.getTabCount('semua')
    const countDraft = wrapper.vm.getTabCount('draft')
    const countBerjalan = wrapper.vm.getTabCount('berjalan')
    const countSelesai = wrapper.vm.getTabCount('selesai')
    const countBatal = wrapper.vm.getTabCount('batal')
    
    expect(countSemua).toBe(countDraft + countBerjalan + countSelesai)
    expect(countSemua).toBe(3)
    expect(countBatal).toBe(2)
  })
})
