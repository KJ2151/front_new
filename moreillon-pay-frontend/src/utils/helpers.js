export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatDate = (date, format = 'long') => {
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  }
  
  return new Intl.DateTimeFormat('en-US', options[format] || options.long).format(new Date(date))
}

export const generateInvoiceNumber = (prefix = 'INV', number) => {
  return `${prefix}${String(number).padStart(5, '0')}`
}

export const calculateDueDate = (invoiceDate, terms = 30) => {
  const date = new Date(invoiceDate)
  date.setDate(date.getDate() + terms)
  return date.toISOString().split('T')[0]
}

export const getStatusColor = (status) => {
  const colors = {
    draft: 'gray',
    sent: 'blue',
    pending: 'yellow',
    paid: 'green',
    overdue: 'red',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

export const truncate = (str, length = 50) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export const debounce = (fn, delay = 300) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

export const downloadFile = (data, filename, type = 'application/pdf') => {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}