import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '@/views/Dashboard.vue'
import { supabase } from '@/lib/supabase'
import SuratJalanDetail from '@/views/SuratJalanDetail.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

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

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { id: 1 } })
}))

const getMockData = () => [
  { id: 1, status: 'CANCELLED', previous_status: 'ON_DELIVERY', created_at: new Date().toISOString() },
  { id: 2, status: 'DELETED', created_at: new Date().toISOString() }
]

describe('A.4 Fitur Tempat Sampah', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.user = { id: 'admin-123' } // Fix Unhandled Rejection
  })

  it('Test 7: surat jalan status ON_DELIVERY dibatalkan -> previous_status tersimpan ON_DELIVERY', async () => {
    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 1, status: 'ON_DELIVERY' }, error: null }),
      update: mockUpdate
    }))
    
    const wrapper = mount(SuratJalanDetail, {
      global: { stubs: ['router-link'] }
    })
    
    await new Promise(r => setTimeout(r, 0))
    
    await wrapper.vm.changeStatus('CANCELLED', 'CANCELLED', 'test reason')
    
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: 'CANCELLED',
      previous_status: 'ON_DELIVERY'
    }))
  })

  it('Test 8: surat jalan CANCELLED dengan previous_status = ON_DELIVERY di-"Pulihkan" -> status balik', async () => {
    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: getMockData(), error: null }),
      update: mockUpdate,
      eq: vi.fn().mockReturnThis()
    }))

    const wrapper = mount(Dashboard, {
      global: { stubs: ['router-link', 'Teleport'] }
    })
    await new Promise(r => setTimeout(r, 0))
    
    const sj = wrapper.vm.suratJalanList[0] 
    await wrapper.vm.restoreSj(sj)
    
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'ON_DELIVERY', previous_status: null })
    expect(sj.status).toBe('ON_DELIVERY')
    expect(sj.previous_status).toBeNull()
  })

  it('Test 9: surat jalan CANCELLED di-"Arsipkan" -> status jadi DELETED', async () => {
    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: getMockData(), error: null }),
      update: mockUpdate,
      eq: vi.fn().mockReturnThis()
    }))

    const wrapper = mount(Dashboard, {
      global: { stubs: ['router-link', 'Teleport'] }
    })
    await new Promise(r => setTimeout(r, 0))
    
    const sj = wrapper.vm.suratJalanList[0]
    wrapper.vm.confirmArchive(sj)
    await wrapper.vm.processArchive()
    
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'DELETED' })
    expect(sj.status).toBe('DELETED')
  })

  it('Test 10: kartu statistik dan hitungan tab TIDAK menghitung status DELETED', async () => {
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: getMockData(), error: null })
    }))

    const wrapper = mount(Dashboard, {
      global: { stubs: ['router-link', 'Teleport'] }
    })
    await new Promise(r => setTimeout(r, 0))
    
    expect(wrapper.vm.getTabCount('semua')).toBe(0) 
    expect(wrapper.vm.getTabCount('batal')).toBe(1) 
  })
})
