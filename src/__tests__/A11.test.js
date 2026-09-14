import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SuratJalanDetail from '@/views/SuratJalanDetail.vue'
import Dashboard from '@/views/Dashboard.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

vi.mock('jspdf', () => {
  const mockAddImage = vi.fn()
  const mockSave = vi.fn()
  return {
    jsPDF: vi.fn().mockImplementation(function() {
      return {
        addImage: mockAddImage,
        save: mockSave,
        internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
      }
    }),
    __mockAddImage: mockAddImage,
    __mockSave: mockSave
  }
})

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,123'),
    width: 800,
    height: 600
  })
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

global.fetch = vi.fn()

describe('A.11 Audit Export PDF & Google Sheets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.user = { id: 'admin-123' }
  })

  it('Perkuat Export PDF: jsPDF.save dan addImage dipanggil dengan benar', async () => {
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 1, nomor_dokumen: 'SJ-01-TEST', status: 'COMPLETED', customer: 'PT Makmur Jaya', tanggal_pengiriman: '2026-09-14' }, error: null })
    }))

    const wrapper = mount(SuratJalanDetail, {
      global: { stubs: ['router-link'] },
      attachTo: document.body 
    })
    
    await new Promise(resolve => setTimeout(resolve, 50))
    await wrapper.vm.$nextTick()
    
    if (!document.getElementById('pdf-template')) {
       const div = document.createElement('div')
       div.id = 'pdf-template'
       document.body.appendChild(div)
    }

    await wrapper.vm.exportPdf()
    
    const { __mockSave, __mockAddImage } = await import('jspdf')

    expect(__mockAddImage).toHaveBeenCalled()
    expect(__mockAddImage.mock.calls[0][0]).toBe('data:image/jpeg;base64,123')
    expect(__mockAddImage.mock.calls[0][1]).toBe('JPEG')

    expect(__mockSave).toHaveBeenCalled()
    expect(__mockSave.mock.calls[0][0]).toContain('SJ-01-TEST')
  })

  it('Audit Export Google Sheets: sendToGoogleSheets berfungsi dan memanggil API dengan benar', async () => {
    const mockSjData = [
      { id: 1, nomor_dokumen: 'SJ-01', customer: 'PT A', tanggal_pengiriman: '2026-09-10', status: 'DELIVERED', admin_id: 'admin-1' },
      { id: 2, nomor_dokumen: 'SJ-02', customer: 'PT B', tanggal_pengiriman: '2026-09-11', status: 'COMPLETED', admin_id: 'admin-2' }
    ]

    let supabaseMockObj = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockSjData, error: null }),
      in: vi.fn().mockResolvedValue({ data: mockSjData, error: null })
    }

    supabase.from.mockImplementation((table) => {
      if (table === 'surat_jalan') {
        return supabaseMockObj
      }
      if (table === 'users') {
        return { select: vi.fn().mockResolvedValue({ data: [{ id: 'admin-1', name: 'Admin One' }, { id: 'admin-2', name: 'Admin Two' }] }) }
      }
    })

    global.fetch.mockResolvedValue({ text: vi.fn().mockResolvedValue(JSON.stringify({ status: 'success', url: 'https://docs.google.com/spreadsheets/d/123/edit' })) })

    const wrapper = mount(Dashboard, { global: { stubs: ['router-link', 'Teleport'] } })
    
    await new Promise(r => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    supabaseMockObj.in = vi.fn().mockResolvedValue({ data: mockSjData, error: null })

    wrapper.vm.selectedSj = [1, 2]
    await wrapper.vm.sendToGoogleSheets()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const fetchCall = global.fetch.mock.calls[0]
    expect(fetchCall[0]).toContain('script.google.com')
    
    const body = JSON.parse(fetchCall[1].body)
    expect(body).toHaveLength(2)
    expect(body[0].nomor_dokumen).toBe('SJ-01')
    expect(body[0].customer).toBe('PT A')
    expect(body[0].dibuat_oleh).toBe('Admin One')
    
    expect(wrapper.vm.generatedSheetUrl).toBe('https://docs.google.com/spreadsheets/d/123/edit')
    expect(wrapper.vm.showSuccessModal).toBe(true)
  })
})
