import invoiceService from '@/services/invoice.service'

export default {
  namespaced: true,
  
  state: {
    invoices: [],
    currentInvoice: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },
  
  getters: {
    invoices: state => state.invoices,
    currentInvoice: state => state.currentInvoice,
    loading: state => state.loading,
    pagination: state => state.pagination
  },
  
  mutations: {
    SET_INVOICES(state, invoices) {
      state.invoices = invoices
    },
    
    SET_CURRENT_INVOICE(state, invoice) {
      state.currentInvoice = invoice
    },
    
    ADD_INVOICE(state, invoice) {
      state.invoices.unshift(invoice)
    },
    
    UPDATE_INVOICE(state, updatedInvoice) {
      const index = state.invoices.findIndex(inv => inv._id === updatedInvoice._id)
      if (index !== -1) {
        state.invoices.splice(index, 1, updatedInvoice)
      }
    },
    
    REMOVE_INVOICE(state, invoiceId) {
      state.invoices = state.invoices.filter(inv => inv._id !== invoiceId)
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    SET_PAGINATION(state, pagination) {
      state.pagination = { ...state.pagination, ...pagination }
    }
  },
  
  actions: {
    async fetchInvoices({ commit }, params = {}) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await invoiceService.getInvoices(params)
        commit('SET_INVOICES', response.data.invoices || response.data)
        
        if (response.data.pagination) {
          commit('SET_PAGINATION', response.data.pagination)
        }
        
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchInvoice({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await invoiceService.getInvoice(id)
        commit('SET_CURRENT_INVOICE', response.data)
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createInvoice({ commit }, invoiceData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await invoiceService.createInvoice(invoiceData)
        commit('ADD_INVOICE', response.data)
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateInvoice({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await invoiceService.updateInvoice(id, data)
        commit('UPDATE_INVOICE', response.data)
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteInvoice({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await invoiceService.deleteInvoice(id)
        commit('REMOVE_INVOICE', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async sendInvoice({ commit }, id) {
      commit('SET_LOADING', true)
      
      try {
        const response = await invoiceService.sendInvoice(id)
        return response
      } catch (error) {
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}