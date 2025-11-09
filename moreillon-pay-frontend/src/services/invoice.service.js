import api from './api'

export default {
  getInvoices(params = {}) {
    return api.get('/invoices', { params })
  },
  
  getInvoice(id) {
    return api.get(`/invoices/${id}`)
  },
  
  createInvoice(invoiceData) {
    return api.post('/invoices', invoiceData)
  },
  
  updateInvoice(id, invoiceData) {
    return api.put(`/invoices/${id}`, invoiceData)
  },
  
  deleteInvoice(id) {
    return api.delete(`/invoices/${id}`)
  },
  
  sendInvoice(id) {
    return api.post(`/invoices/${id}/send`)
  },
  
  downloadInvoice(id) {
    return api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
  }
}