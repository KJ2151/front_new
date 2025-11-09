import authService from '@/services/auth.service'

export default {
  namespaced: true,
  
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  },
  
  getters: {
    user: state => state.user,
    token: state => state.token,
    isAuthenticated: state => state.isAuthenticated
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    
    LOGOUT(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await authService.login(credentials)
        const { token, user } = response.data
        
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        
        return response
      } catch (error) {
        commit('LOGOUT')
        throw error
      }
    },
    
    async register({ commit }, userData) {
      try {
        const response = await authService.register(userData)
        const { token, user } = response.data
        
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        
        return response
      } catch (error) {
        throw error
      }
    },
    
    async logout({ commit }) {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        commit('LOGOUT')
      }
    },
    
    async fetchUser({ commit }) {
      try {
        const response = await authService.getCurrentUser()
        commit('SET_USER', response.data)
        return response
      } catch (error) {
        commit('LOGOUT')
        throw error
      }
    },
    
    async updateProfile({ commit }, userData) {
      const response = await authService.updateProfile(userData)
      commit('SET_USER', response.data)
      return response
    }
  }
}