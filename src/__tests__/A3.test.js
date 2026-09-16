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
              { id: 1, status: 'DRAFT', tanggal_pengiriman: '2026-09-14T14:00:00.000Z', created_at: new Date().toISOString() },
              { id: 2, status: 'DRAFT', tanggal_pengiriman: '2026-09-14T00:00:00.000Z', created_at: new Date().toISOString() },
              { id: 3, status: 'DRAFT', tanggal_pengiriman: '2026-09-15T10:00:00.000Z', created_at: new Date().toISOString() },
              { id: 4, status: 'DRAFT', tanggal_pengiriman: '2026-09-13T23:59:59.000Z', created_at: new Date().toISOString() },
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

describe('A.3 Bug Boundary Tanggal', () => {
  it('dateEnd mencakup hingga 23:59:59 di tanggal tersebut', async () => {
    const wrapper = mount(Dashboard, {
      global: {
        stubs: ['router-link']
      }
    })
    
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    
    wrapper.vm.dateStart = ''
    wrapper.vm.dateEnd = '2026-09-14'
    
    const filtered = wrapper.vm.filteredList
    // Should include id 1, 2, 4
    // id 1: 2026-09-14 14:00 <= 2026-09-14 23:59:59
    // id 2: 2026-09-14 00:00 <= 2026-09-14 23:59:59
    // id 3: 2026-09-15 10:00 (excluded)
    // id 4: 2026-09-13 23:59 (included)
    expect(filtered.find(i => i.id === 1)).toBeDefined()
    expect(filtered.find(i => i.id === 2)).toBeDefined()
    expect(filtered.find(i => i.id === 3)).toBeUndefined()
    expect(filtered.find(i => i.id === 4)).toBeDefined()
  })
  
  it('dateStart mencakup dari 00:00:00 di tanggal tersebut', async () => {
    const wrapper = mount(Dashboard, {
      global: {
        stubs: ['router-link']
      }
    })
    
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    
    wrapper.vm.dateStart = '2026-09-14'
    wrapper.vm.dateEnd = ''
    
    const filtered = wrapper.vm.filteredList
    // Should include id 1, 2, 3
    // id 1: 2026-09-14 14:00 >= 2026-09-14 00:00
    // id 2: 2026-09-14 00:00 >= 2026-09-14 00:00
    // id 3: 2026-09-15 10:00 >= 2026-09-14 00:00
    // id 4: 2026-09-13 23:59 (excluded)
    expect(filtered.find(i => i.id === 1)).toBeDefined()
    expect(filtered.find(i => i.id === 2)).toBeDefined()
    expect(filtered.find(i => i.id === 3)).toBeDefined()
    expect(filtered.find(i => i.id === 4)).toBeUndefined()
  })
})
