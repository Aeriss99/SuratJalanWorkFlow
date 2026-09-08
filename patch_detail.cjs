const fs = require('fs')

let content = fs.readFileSync('src/views/SuratJalanDetail.vue', 'utf8')

// Remove Action Blocks
content = content.replace(/<!-- DRAFT -->[\s\S]*?BUKA PENUGASAN\s*<\/button>\s*<\/div>/, '')
content = content.replace(/<!-- ASSIGNED \(Open Task\) -->[\s\S]*?AMBIL & KERJAKAN TUGAS INI\s*<\/button>\s*<\/div>/, '')
content = content.replace(/<!-- ACCEPTED \(Start Delivery\) -->[\s\S]*?MULAI PENGIRIMAN\s*<\/button>\s*<\/div>/, '')
content = content.replace(/<!-- Batal Kirim \/ Tarik Tugas -->[\s\S]*?Batalkan Penugasan Ini\s*<\/button>\s*<\/div>/, '')

// Remove && isAssignedDriver from ON_DELIVERY check since we removed driver stuff
content = content.replace(/v-if="sj\.status === 'ON_DELIVERY' && isAssignedDriver"/, `v-if="sj.status === 'ON_DELIVERY'"`)

fs.writeFileSync('src/views/SuratJalanDetail.vue', content)
