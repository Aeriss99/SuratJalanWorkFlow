const fs = require('fs')
let content = fs.readFileSync('src/views/SuratJalanDetail.vue', 'utf8')

// Remove rejection_reason from update object
const oldUpdate = `.update({ status: newStatus, rejection_reason: reason })`
const newUpdate = `.update({ status: newStatus })`

content = content.replace(oldUpdate, newUpdate)

fs.writeFileSync('src/views/SuratJalanDetail.vue', content)
