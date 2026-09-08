const fs = require('fs')

let content = fs.readFileSync('src/views/SuratJalanDetail.vue', 'utf8')

// Remove acceptTask, recallAssignment, rejectAssignment functions entirely
content = content.replace(/const acceptTask = \(\) => {[\s\S]*?\}\n  }\)\n}/, '')
content = content.replace(/const recallAssignment = \(\) => {[\s\S]*?\}\n  }\)\n}/, '')
content = content.replace(/const rejectAssignment = \(\) => {[\s\S]*?\}\n  }\)\n}/, '')

// Remove isAssignedDriver since it's no longer used or needed
content = content.replace(/const isAssignedDriver = computed\(\(\) => sj\.value\?\.supir_id === authStore\.user\.id\)/, '')

fs.writeFileSync('src/views/SuratJalanDetail.vue', content)
