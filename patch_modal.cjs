const fs = require('fs')

let content = fs.readFileSync('src/views/SuratJalanDetail.vue', 'utf8')

// 1. Insert Teleport Modal HTML before </template>
const modalHtml = `
    <Teleport to="body">
      <div v-if="modalConfig.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
        <div class="bg-white border-4 border-gray-900 shadow-neo rounded-2xl p-6 w-full max-w-md">
          <h3 class="text-xl font-black text-gray-900 mb-2">{{ modalConfig.title }}</h3>
          <p class="text-sm font-bold mb-4" :class="modalConfig.danger ? 'text-red-600' : 'text-gray-600'">{{ modalConfig.message }}</p>
          
          <div v-if="modalConfig.requireReason" class="mb-6">
            <label class="block text-sm font-bold text-gray-900 mb-2">{{ modalConfig.reasonLabel }}</label>
            <textarea 
              v-model="modalConfig.reason" 
              rows="3" 
              class="w-full border-2 border-gray-900 rounded-xl p-3 font-medium focus:ring-0 focus:border-blue-600 outline-none"
              placeholder="Masukkan alasan..."
            ></textarea>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="closeModal" class="flex-1 px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-bold hover:bg-gray-100 transition-colors">
              Kembali
            </button>
            <button @click="confirmModal" :disabled="(modalConfig.requireReason && !modalConfig.reason.trim()) || submitting" 
              class="flex-1 px-4 py-3 border-2 border-gray-900 rounded-xl font-black shadow-neo active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0"
              :class="modalConfig.danger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-400 text-gray-900 hover:bg-blue-500'">
              {{ modalConfig.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
</template>
`
content = content.replace('</template>', modalHtml)

// 2. Insert modal setup state and functions
const modalState = `
const modalConfig = ref({
  show: false,
  title: '',
  message: '',
  requireReason: false,
  reasonLabel: 'Alasan:',
  reason: '',
  danger: false,
  confirmText: 'Lanjutkan',
  onConfirm: null
})

const openModal = (config) => {
  modalConfig.value = {
    show: true,
    title: config.title || 'Konfirmasi',
    message: config.message || '',
    requireReason: config.requireReason || false,
    reasonLabel: config.reasonLabel || 'Alasan:',
    reason: '',
    danger: config.danger || false,
    confirmText: config.confirmText || 'Lanjutkan',
    onConfirm: config.onConfirm
  }
}

const closeModal = () => {
  modalConfig.value.show = false
}

const confirmModal = () => {
  if (modalConfig.value.requireReason && !modalConfig.value.reason.trim()) {
    showToast('Alasan harus diisi', 'error')
    return
  }
  if (modalConfig.value.onConfirm) {
    modalConfig.value.onConfirm(modalConfig.value.reason)
  }
  closeModal()
}

const deleteDocument =`

content = content.replace('const deleteDocument =', modalState)

// 3. Patch deleteDocument
const oldDeleteDocument = `const deleteDocument = async () => {
  if (!confirm('Apakah Anda yakin ingin menghapus Draf ini secara permanen?')) return
  try {
    submitting.value = true
    const { error } = await supabase.from('surat_jalan').delete().eq('id', sj.value.id)
    if (error) throw error
    showToast('Dokumen berhasil dihapus', 'success')
    router.push('/')
  } catch (err) {
    showToast('Gagal menghapus dokumen', 'error')
  } finally {
    submitting.value = false
  }
}`

const newDeleteDocument = `const deleteDocument = () => {
  openModal({
    title: 'Hapus Dokumen',
    message: 'Apakah Anda yakin ingin menghapus dokumen ini secara permanen?',
    danger: true,
    confirmText: 'Hapus Permanen',
    onConfirm: async () => {
      try {
        submitting.value = true
        const { error } = await supabase.from('surat_jalan').delete().eq('id', sj.value.id)
        if (error) throw error
        showToast('Dokumen berhasil dihapus', 'success')
        router.push('/')
      } catch (err) {
        showToast('Gagal menghapus dokumen', 'error')
      } finally {
        submitting.value = false
      }
    }
  })
}`
content = content.replace(oldDeleteDocument, newDeleteDocument)

// 4. Patch cancelDocument
const oldCancelDocument = `const cancelDocument = async () => {
  const reason = prompt("Alasan membatalkan dokumen ini:")
  if (!reason) return
  if (!confirm('Peringatan: Dokumen yang dibatalkan tidak bisa dikembalikan. Lanjutkan?')) return
  
  changeStatus('CANCELLED', 'CANCELLED', reason)
}`

const newCancelDocument = `const cancelDocument = () => {
  openModal({
    title: 'Batalkan Dokumen',
    message: 'Peringatan: Dokumen yang dibatalkan tidak bisa dikembalikan. Lanjutkan?',
    danger: true,
    requireReason: true,
    reasonLabel: 'Alasan membatalkan dokumen ini:',
    confirmText: 'Batalkan Dokumen',
    onConfirm: (reason) => {
      changeStatus('CANCELLED', 'CANCELLED', reason)
    }
  })
}`
content = content.replace(oldCancelDocument, newCancelDocument)

// 5. Patch changeStatusSafe
const oldChangeStatusSafe = `const changeStatusSafe = (newStatus, actionLabel, promptText = null) => {
  if (promptText) {
    if (!confirm(promptText)) return
  }
  changeStatus(newStatus, actionLabel)
}`

const newChangeStatusSafe = `const changeStatusSafe = (newStatus, actionLabel, promptText = null) => {
  if (promptText) {
    openModal({
      title: 'Konfirmasi',
      message: promptText,
      confirmText: 'Ya, Lanjutkan',
      onConfirm: () => {
        changeStatus(newStatus, actionLabel)
      }
    })
  } else {
    changeStatus(newStatus, actionLabel)
  }
}`
content = content.replace(oldChangeStatusSafe, newChangeStatusSafe)

// 6. Patch acceptTask
const oldAcceptTask = `const acceptTask = async () => {
  if (!confirm('Ambil dan kerjakan tugas ini?')) return
  try {`
const newAcceptTask = `const acceptTask = () => {
  openModal({
    title: 'Ambil Tugas',
    message: 'Ambil dan kerjakan tugas ini?',
    confirmText: 'Ambil Tugas',
    onConfirm: async () => {
  try {`
content = content.replace(oldAcceptTask, newAcceptTask)
// Fix the closing bracket for acceptTask
content = content.replace(/finally {\n    submitting.value = false\n  }\n}/, `finally {\n    submitting.value = false\n  }\n    }\n  })\n}`)

// 7. Patch recallAssignment
const oldRecallAssignment = `const recallAssignment = async () => {
  const reason = prompt("Alasan membatalkan penugasan ini (Truk rusak, dll):")
  if (!reason) return
  
  try {`
const newRecallAssignment = `const recallAssignment = () => {
  openModal({
    title: 'Batalkan Penugasan',
    message: 'Apakah Anda yakin ingin membatalkan penugasan ini?',
    danger: true,
    requireReason: true,
    reasonLabel: 'Alasan membatalkan (Truk rusak, dll):',
    confirmText: 'Batalkan Tugas',
    onConfirm: async (reason) => {
  try {`
content = content.replace(oldRecallAssignment, newRecallAssignment)
content = content.replace(/finally {\n    submitting.value = false\n  }\n}/g, `finally {\n    submitting.value = false\n  }\n    }\n  })\n}`)

// 8. Patch rejectAssignment (if exists)
const oldRejectAssignment = `const rejectAssignment = () => {
  const reason = prompt("Alasan menolak tugas:")
  if (!reason) return
  
  // Revert back to APPROVED, remove supir_id
  supabase.from('surat_jalan')`
const newRejectAssignment = `const rejectAssignment = () => {
  openModal({
    title: 'Tolak Tugas',
    message: 'Apakah Anda yakin ingin menolak tugas ini?',
    danger: true,
    requireReason: true,
    reasonLabel: 'Alasan menolak tugas:',
    confirmText: 'Tolak Tugas',
    onConfirm: (reason) => {
  // Revert back to APPROVED, remove supir_id
  supabase.from('surat_jalan')`
content = content.replace(oldRejectAssignment, newRejectAssignment)
content = content.replace(/fetchDetail\(\)\n    \}\)\n\}/, `fetchDetail()\n    })\n    }\n  })\n}`)

// 9. Patch submitDelivery
const oldSubmitDelivery = `  if (isEmpty) return showToast('Tanda tangan penerima wajib diisi', 'error')
  if (!confirm('Selesaikan pengiriman sekarang?')) return

  try {`
const newSubmitDelivery = `  if (isEmpty) return showToast('Tanda tangan penerima wajib diisi', 'error')

  openModal({
    title: 'Selesaikan Pengiriman',
    message: 'Selesaikan pengiriman sekarang?',
    confirmText: 'Selesaikan',
    onConfirm: async () => {
  try {`
content = content.replace(oldSubmitDelivery, newSubmitDelivery)
content = content.replace(/finally {\n    submitting.value = false\n  }\n}/, `finally {\n    submitting.value = false\n  }\n    }\n  })\n}`)

fs.writeFileSync('src/views/SuratJalanDetail.vue', content)
