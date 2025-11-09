import { createStore } from 'vuex'
import auth from './modules/auth'
import invoices from './modules/invoices'
import payments from './modules/payments'

export default createStore({
  modules: {
    auth,
    invoices,
    payments
  },
  
  state: {
    loading: false,
    error: null
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    }
  }
})