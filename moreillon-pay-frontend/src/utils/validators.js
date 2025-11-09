export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/
  return re.test(phone)
}

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== ''
}

export const validateMin = (value, min) => {
  return Number(value) >= min
}

export const validateMax = (value, max) => {
  return Number(value) <= max
}

export const validateLength = (value, min, max) => {
  const length = value ? value.length : 0
  return length >= min && length <= max
}

export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateInvoice = (invoice) => {
  const errors = {}
  
  if (!invoice.client?.name) {
    errors.clientName = 'Client name is required'
  }
  
  if (!invoice.client?.email) {
    errors.clientEmail = 'Client email is required'
  } else if (!validateEmail(invoice.client.email)) {
    errors.clientEmail = 'Invalid email address'
  }
  
  if (!invoice.date) {
    errors.date = 'Invoice date is required'
  }
  
  if (!invoice.dueDate) {
    errors.dueDate = 'Due date is required'
  }
  
  if (!invoice.items || invoice.items.length === 0) {
    errors.items = 'At least one item is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}