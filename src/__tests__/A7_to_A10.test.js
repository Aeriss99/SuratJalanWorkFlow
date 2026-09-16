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
  { id: 1, status: 'DRAFT', customer: 'PT A', created_at: new Date().toISOString() }, // no date
  { id: 2, status: 'COMPLETED', customer: 'PT A', tanggal_pengiriman: '2026-09-10', created_at: new Date().toISOString() },
  { id: 3, status: 'COMPLETED', customer: 'PT B', tanggal_pengiriman: '2026-09-11', created_at: new Date().toISOString() }
]

describe('A.7 to A.10', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [...mockData], error: null })
    }))
  })

  it('A.7: Keyboard accessibility for cards', async () => {
    const wrapper = mount(Dashboard, { global: { stubs: ['router-link', 'Teleport'] } })
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.activeTab).toBe('semua')
    
    // Find the draft tab card
    const draftCard = wrapper.findAll('div[role="button"]').find(w => w.text().toLowerCase().includes('draft'))
    await draftCard.trigger('keydown.space')
    
    expect(wrapper.vm.activeTab).toBe('draft')
  })

  it('A.9: Sync statistics card counts with active customer/date/search filters', async () => {
    const wrapper = mount(Dashboard, { global: { stubs: ['router-link', 'Teleport'] } })
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.getTabCount('selesai')).toBe(2)
    
    wrapper.vm.customerFilter = 'PT A'
    await wrapper.vm.$nextTick()
    
    // Since we filtered to PT A, completed count should drop to 1
    expect(wrapper.vm.getTabCount('selesai')).toBe(1)
  })

  it('A.10: Interaction of date filter with Draft tab', async () => {
    const wrapper = mount(Dashboard, { global: { stubs: ['router-link', 'Teleport'] } })
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
    
    // Set date filter
    wrapper.vm.dateStart = '2026-09-01'
    wrapper.vm.dateEnd = '2026-09-30'
    await wrapper.vm.$nextTick()
    
    // Switch to Draft tab
    wrapper.vm.activeTab = 'draft'
    await wrapper.vm.$nextTick()
    
    // Date filter is ignored when in Draft tab, so Draft items without date should still appear
    expect(wrapper.vm.filteredList.length).toBe(1)
    expect(wrapper.vm.filteredList[0].id).toBe(1)
  })
})
