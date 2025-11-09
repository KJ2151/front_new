import paymentService from '@/services/payment.service'

export default {
  namespaced: true,
  
  state: {
    payments: [],
    currentPayment: null,
    loading: false,
    error: null
  },
  
  getters: {
    payments: state => state.payments,
    currentPayment: state => state.currentPayment,
    loading: state => state.loading
  },
  
  mutations: {
    SET_PAYMENTS(state, payments) {
      state.payments = payments
    },
    
    SET_CURRENT_PAYMENT(state, payment) {
      state.currentPayment = payment
    },
    
    ADD_PAYMENT(state, payment) {
      state.payments.unshift(payment)
    },
    
    UPDATE_PAYMENT(state, updatedPayment) {
      const index = state.payments.findIndex(p => p._id === updatedPayment._id)
      if (index !== -1) {
        state.payments.splice(index, 1, updatedPayment)
      }
    },
    
    REMOVE_PAYMENT(state, paymentId) {
      state.payments = state.payments.filter(p => p._id !== paymentId)
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchPayments({ commit }, params = {}) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await paymentService.getPayments(params)
        commit('SET_PAYMENTS', response.data.payments || response.data)
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createPayment({ commit }, paymentData) {
      commit('SET_LOADING', true)
      
      try {
        const response = await paymentService.createPayment(paymentData)
        commit('ADD_PAYMENT', response.data)
        return response
      } catch (error) {
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async recordPayment({ commit }, { invoiceId, paymentData }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await paymentService.recordPayment(invoiceId, paymentData)
        commit('ADD_PAYMENT', response.data)
        return response
      } catch (error) {
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deletePayment({ commit }, id) {
      commit('SET_LOADING', true)
      
      try {
        await paymentService.deletePayment(id)
        commit('REMOVE_PAYMENT', id)
      } catch (error) {
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}