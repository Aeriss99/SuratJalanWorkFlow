export const STATUS_LABELS = {
  'DRAFT': 'DRAF',
  'SUBMITTED': 'MENUNGGU REVIEW',
  'APPROVED': 'DISETUJUI',
  'ASSIGNED': 'MENUNGGU SUPIR',
  'ACCEPTED': 'DITERIMA SUPIR',
  'ON_DELIVERY': 'DALAM PENGIRIMAN',
  'DELIVERED': 'TERKIRIM',
  'COMPLETED': 'SELESAI',
  'REJECTED': 'DITOLAK',
  'CANCELLED': 'DIBATALKAN'
}

export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status
}

export const statusColor = (status) => {
  const colors = {
    'DRAFT': 'bg-gray-100 text-gray-800 border-gray-900',
    'SUBMITTED': 'bg-yellow-100 text-yellow-900 border-yellow-900',
    'APPROVED': 'bg-green-100 text-green-900 border-green-900',
    'ASSIGNED': 'bg-orange-100 text-orange-900 border-orange-900',
    'ACCEPTED': 'bg-indigo-100 text-indigo-900 border-indigo-900',
    'ON_DELIVERY': 'bg-purple-100 text-purple-900 border-purple-900',
    'DELIVERED': 'bg-teal-100 text-teal-900 border-teal-900',
    'COMPLETED': 'bg-blue-100 text-blue-900 border-blue-900',
    'REJECTED': 'bg-red-100 text-red-900 border-red-900',
    'CANCELLED': 'bg-gray-300 text-gray-900 border-gray-900'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-900'
}
