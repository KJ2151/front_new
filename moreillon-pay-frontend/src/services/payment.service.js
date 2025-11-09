import api from './api'

export default {
  getPayments(params = {}) {
    return api.get('/payments', { params })
  },
  
  getPayment(id) {
    return api.get(`/payments/${id}`)
  },
  
  createPayment(paymentData) {
    return api.post('/payments', paymentData)
  },
  
  updatePayment(id, paymentData) {
    return api.put(`/payments/${id}`, paymentData)
  },
  
  deletePayment(id) {
    return api.delete(`/payments/${id}`)
  },
  
  recordPayment(invoiceId, paymentData) {
    return api.post(`/invoices/${invoiceId}/payments`, paymentData)
  }
}