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

const mockData = [
  { id: 1, status: 'DRAFT', customer: 'PT A', created_at: new Date().toISOString() }, // draft without date
  { id: 2, status: 'COMPLETED', customer: 'PT B', tanggal_pengiriman: '2026-09-10', created_at: new Date().toISOString() },
  { id: 3, status: 'COMPLETED', customer: 'PT C', tanggal_pengiriman: '2026-09-20', created_at: new Date().toISOString() }
]

describe('A.13 Fix getTabCount and Duplicate Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [...mockData], error: null })
    }))
  })

  it('Date filter should not affect Draft count, but should affect Selesai count', async () => {
    const wrapper = mount(Dashboard, { global: { stubs: ['router-link', 'Teleport'] } })
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.getTabCount('draft')).toBe(1)
    expect(wrapper.vm.getTabCount('selesai')).toBe(2)
    
    // Set date filter to exclude id=3
    wrapper.vm.dateStart = '2026-09-01'
    wrapper.vm.dateEnd = '2026-09-15'
    await wrapper.vm.$nextTick()
    
    // The active tab defaults to 'semua'
    // Even when active tab is 'semua', draft count should remain 1 because date filter is exempt for 'draft' tab
    expect(wrapper.vm.getTabCount('draft')).toBe(1)
    
    // Selesai count should drop to 1
    expect(wrapper.vm.getTabCount('selesai')).toBe(1)

    // Now switch to 'draft' tab
    wrapper.vm.activeTab = 'draft'
    await wrapper.vm.$nextTick()

    // Even when on 'draft' tab, the 'selesai' count should still accurately reflect the date filter (1)
    expect(wrapper.vm.getTabCount('selesai')).toBe(1)
  })
})
