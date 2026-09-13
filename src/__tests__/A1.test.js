import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '@/views/Dashboard.vue'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => ({
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 1, nomor_dokumen: 'SJ-01', status: 'COMPLETED', created_at: new Date(Date.now() - 10 * 86400000).toISOString() }, // 10 days ago
              { id: 2, nomor_dokumen: 'SJ-02', status: 'COMPLETED', created_at: new Date(Date.now() - 40 * 86400000).toISOString() }, // 40 days ago
              { id: 3, nomor_dokumen: 'SJ-03', status: 'COMPLETED', created_at: new Date(Date.now() - 5 * 86400000).toISOString() }  // 5 days ago
            ],
            error: null
          })
        })
      })
    })
  }
}))

// Mock Navbar component
vi.mock('@/components/Navbar.vue', () => ({
  default: {
    template: '<div>Navbar</div>'
  }
}))

describe('A.1 Filter 30 Hari Tab Selesai', () => {
  it('tab selesai tanpa filter apa pun -> hanya tampilkan data <= 30 hari', async () => {
    const wrapper = mount(Dashboard, {
      global: {
        stubs: ['router-link']
      }
    })
    
    // Tunggu fetch selesai
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    
    wrapper.vm.activeTab = 'selesai'
    
    // Pastikan filter manual kosong
    wrapper.vm.searchQuery = ''
    wrapper.vm.customerFilter = ''
    wrapper.vm.dateStart = ''
    wrapper.vm.dateEnd = ''
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.length).toBe(2) // Hanya item 1 dan 3 (10 dan 5 hari lalu)
    expect(filtered.find(i => i.id === 2)).toBeUndefined() // Item 2 (40 hari lalu) difilter
  })

  it('tab selesai dengan search/customer/date filter aktif -> filter 30 hari tidak berlaku', async () => {
    const wrapper = mount(Dashboard, {
      global: {
        stubs: ['router-link']
      }
    })
    
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    
    wrapper.vm.activeTab = 'selesai'
    
    // Set salah satu filter aktif
    wrapper.vm.searchQuery = 'SJ-0' // akan match semua
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.length).toBe(3) // Semua data tampil walau ada yang lebih 30 hari
  })
})
