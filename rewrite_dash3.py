import re
base_path = '/home/lingz69/Development/SuratJalanWorkFlow/'

with open(base_path + 'src/views/Dashboard.vue', 'r') as f:
    content = f.read()

# 1. Update tabs for 'Batal' to NOT include DELETED
old_tabs_array = """  { id: 'batal', name: 'Batal', statuses: ['CANCELLED', 'DELETED'],
    bg: 'bg-red-50', text: 'text-red-900', activeBorder: 'border-red-500' },"""
new_tabs_array = """  { id: 'batal', name: 'Batal', statuses: ['CANCELLED'],
    bg: 'bg-red-50', text: 'text-red-900', activeBorder: 'border-red-500' },"""
content = content.replace(old_tabs_array, new_tabs_array)

# 2. Add action buttons for CANCELLED items
old_item_block = """                <div class="hidden sm:flex flex-shrink-0 items-center">
                  <span class="px-3 py-1 text-xs font-bold rounded-full border-2" :class="statusColor(sj.status)">
                    {{ getStatusLabel(sj.status) }}
                  </span>
                </div>
              </div>
            </router-link>
            </div>
          </div>"""

new_item_block = """                <div class="hidden sm:flex flex-shrink-0 items-center">
                  <span class="px-3 py-1 text-xs font-bold rounded-full border-2" :class="statusColor(sj.status)">
                    {{ getStatusLabel(sj.status) }}
                  </span>
                </div>
              </div>
            </router-link>
              <div v-if="sj.status === 'CANCELLED'" class="px-4 pb-4 sm:px-6 sm:pb-5">
                <div class="pt-4 border-t-2 border-gray-100 flex gap-2">
                  <button @click="restoreSj(sj)" class="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors">Pulihkan</button>
                  <button @click="confirmArchive(sj)" class="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg border-2 border-red-200 hover:bg-red-100 transition-colors">Arsipkan</button>
                </div>
              </div>
            </div>
          </div>"""
content = content.replace(old_item_block, new_item_block)

# 3. Fetch previous_status
old_select = ".select('id, nomor_dokumen, status, customer, tanggal_pengiriman, supir_id, created_at')"
new_select = ".select('id, nomor_dokumen, status, previous_status, customer, tanggal_pengiriman, supir_id, created_at')"
content = content.replace(old_select, new_select)

# 4. Add methods restoreSj, confirmArchive, processArchive
old_script_start = "const copySuccessMessage = ref(false)"
new_script_start = """const copySuccessMessage = ref(false)

const sjToArchive = ref(null)
const showArchiveModal = ref(false)

const restoreSj = async (sj) => {
  try {
    const newStatus = sj.previous_status || 'DRAFT'
    const { error } = await supabase
      .from('surat_jalan')
      .update({ status: newStatus, previous_status: null })
      .eq('id', sj.id)
      
    if (error) throw error
    
    // Update local state
    sj.status = newStatus
    sj.previous_status = null
    alert('Berhasil dipulihkan ke status ' + newStatus)
  } catch(e) {
    alert('Gagal memulihkan: ' + e.message)
  }
}

const confirmArchive = (sj) => {
  sjToArchive.value = sj
  showArchiveModal.value = true
}

const processArchive = async () => {
  if (!sjToArchive.value) return
  try {
    const { error } = await supabase
      .from('surat_jalan')
      .update({ status: 'DELETED' })
      .eq('id', sjToArchive.value.id)
      
    if (error) throw error
    
    // Update local state
    sjToArchive.value.status = 'DELETED'
    showArchiveModal.value = false
    sjToArchive.value = null
  } catch(e) {
    alert('Gagal mengarsipkan: ' + e.message)
  }
}
"""
content = content.replace(old_script_start, new_script_start)

# 5. Add Archive Modal to Teleport
old_teleport = "<!-- Modal Export Google Sheets -->"
new_teleport = """<!-- Modal Konfirmasi Arsip -->
      <Teleport to="body">
        <div v-if="showArchiveModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div class="bg-white border-4 border-gray-900 shadow-neo rounded-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 class="text-xl font-black text-gray-900 mb-2">Konfirmasi Arsip</h3>
            <p class="text-sm font-medium text-gray-600 mb-6">Surat jalan ini akan diarsipkan dan tidak akan tampil lagi di daftar. Lanjutkan?</p>
            <div class="flex gap-3">
              <button @click="showArchiveModal = false" class="flex-1 px-4 py-2 border-2 border-gray-900 rounded-xl text-gray-900 font-bold hover:bg-gray-100 transition-colors">Batalkan</button>
              <button @click="processArchive" class="flex-1 px-4 py-2 border-2 border-gray-900 rounded-xl font-black shadow-neo active:translate-y-0.5 active:shadow-none transition-all bg-red-400 hover:bg-red-500 text-gray-900">Ya, Arsipkan</button>
            </div>
          </div>
        </div>
      </Teleport>
      
      <!-- Modal Export Google Sheets -->"""
content = content.replace(old_teleport, new_teleport)

with open(base_path + 'src/views/Dashboard.vue', 'w') as f:
    f.write(content)
