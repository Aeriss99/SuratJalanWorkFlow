import re

base_path = '/home/lingz69/Development/SuratJalanWorkFlow/'

with open(base_path + 'src/views/Dashboard.vue', 'r') as f:
    content = f.read()

# The duplicate block starts with `const sjToArchive = ref(null)` down to the end of `processArchive`
duplicate_pattern = r'const sjToArchive = ref\(null\).*?alert\(\'Gagal mengarsipkan: \' \+ e\.message\)\n  \}\n\}\n'

# Find all occurrences
matches = list(re.finditer(duplicate_pattern, content, flags=re.DOTALL))
if len(matches) > 1:
    # Remove the second occurrence
    content = content[:matches[1].start()] + content[matches[1].end():]

# Same for the Teleport Modal
modal_pattern = r'<!-- Modal Konfirmasi Arsip -->.*?<!-- Modal Export Google Sheets -->'
modal_matches = list(re.finditer(modal_pattern, content, flags=re.DOTALL))
if len(modal_matches) > 1:
    # Replace the first occurrence with nothing (keep the second, or vice versa)
    content = content[:modal_matches[1].start()] + content[modal_matches[1].end():]

with open(base_path + 'src/views/Dashboard.vue', 'w') as f:
    f.write(content)
