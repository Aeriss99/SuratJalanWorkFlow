const fs = require('fs')

let content = fs.readFileSync('src/views/SuratJalanDetail.vue', 'utf8')

// 1. Fix Ekspor Excel condition (remove v-if="!['DRAFT', 'CANCELLED', 'DELETED'].includes(sj.status)")
// wait, the current condition is:
// <button v-if="!['DRAFT', 'CANCELLED', 'DELETED'].includes(sj.status)" @click="exportExcel"
const oldExcelBtn = /<button v-if="!\['DRAFT', 'CANCELLED', 'DELETED'\]\.includes\(sj\.status\)" @click="exportExcel"/g
content = content.replace(oldExcelBtn, '<button @click="exportExcel"')

// Or maybe it was just:
// <button v-if="!['DRAFT', 'CANCELLED', 'DELETED'].includes(sj.status)" @click="exportExcel"
// Let's replace ANY condition on exportExcel
content = content.replace(/<button[^>]*@click="exportExcel"[^>]*>/, (match) => {
    return match.replace(/v-if="[^"]*"/, '')
})

// 2. Add Hapus Permanen button next to Pulihkan ke Draf
const restoreBtnPattern = /<button v-if="\['CANCELLED', 'DELETED'\].includes\(sj\.status\) && isAdmin" @click="restoreToDraft"[\s\S]*?<\/button>/
const hardDeleteBtn = `
          <button v-if="sj.status === 'DELETED' && isAdmin" @click="hardDeleteDocument" :disabled="submitting" class="flex-1 sm:flex-none justify-center px-4 py-2 border-2 border-red-900 shadow-neo text-sm font-bold rounded-xl text-white bg-red-800 hover:bg-red-900 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            Hapus Permanen
          </button>`
          
content = content.replace(restoreBtnPattern, (match) => match + hardDeleteBtn)

// 3. Add hardDeleteDocument method
const hardDeleteMethod = `
const hardDeleteDocument = () => {
  openModal({
    title: 'Hapus Permanen',
    message: 'Tindakan ini tidak dapat dibatalkan. Dokumen akan lenyap dari database selamanya.',
    danger: true,
    confirmText: 'Hapus Permanen',
    onConfirm: async () => {
      try {
        submitting.value = true
        const { error } = await supabase.from('surat_jalan').delete().eq('id', sj.value.id)
        if (error) throw error
        showToast('Dokumen dihapus permanen', 'success')
        router.push('/')
      } catch (err) {
        showToast('Gagal menghapus permanen', 'error')
      } finally {
        submitting.value = false
      }
    }
  })
}

const deleteDocument = () => {`

content = content.replace('const deleteDocument = () => {', hardDeleteMethod)

fs.writeFileSync('src/views/SuratJalanDetail.vue', content)
