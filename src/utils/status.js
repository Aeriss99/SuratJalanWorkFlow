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
    'DRAFT': 'bg-gray-100 text-gray-700 border-gray-400',
    'ASSIGNED': 'bg-orange-100 text-orange-800 border-orange-400',
    'ACCEPTED': 'bg-orange-100 text-orange-800 border-orange-400',
    'ON_DELIVERY': 'bg-orange-100 text-orange-800 border-orange-400',
    'DELIVERED': 'bg-green-100 text-green-800 border-green-400',
    'COMPLETED': 'bg-green-100 text-green-800 border-green-400',
    'CANCELLED': 'bg-red-100 text-red-800 border-red-400',
    'DELETED': 'bg-red-100 text-red-800 border-red-400 line-through'
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-400'
}
