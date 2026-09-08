export const STATUS_LABELS = {
  'DRAFT': 'DRAF',
  'ASSIGNED': 'DITUGASKAN',
  'ACCEPTED': 'DITERIMA',
  'ON_DELIVERY': 'DALAM PENGIRIMAN',
  'DELIVERED': 'TERKIRIM',
  'COMPLETED': 'SELESAI',
  'CANCELLED': 'DIBATALKAN',
  'DELETED': 'DIHAPUS'
}

export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status
}

export const statusColor = (status) => {
  const colors = {
    'DRAFT': 'bg-gray-100 text-gray-800 border-gray-900',
    'ASSIGNED': 'bg-orange-100 text-orange-900 border-orange-900',
    'ACCEPTED': 'bg-indigo-100 text-indigo-900 border-indigo-900',
    'ON_DELIVERY': 'bg-purple-100 text-purple-900 border-purple-900',
    'DELIVERED': 'bg-teal-100 text-teal-900 border-teal-900',
    'COMPLETED': 'bg-blue-100 text-blue-900 border-blue-900',
    'CANCELLED': 'bg-red-100 text-red-900 border-red-900',
    'DELETED': 'bg-gray-300 text-gray-900 border-gray-900 line-through'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-900'
}
