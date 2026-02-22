import Api from '@/libs/apiCall.js'
import lsp from '@/libs/LocalStoragePack.js'

export default {
  namespaced: true,
  namespace: 'auth',
  state: () => ({
    authData: lsp.loadObject('authData') || null,
  }),
  getters: {
    userToken: state => state.authData?.access_token || null,
    userName: state => state.authData?.user?.name || null,
    userRoles: state => state.authData?.user?.roles || [],
  },
  mutations: {
    AUTH_LOGIN: (state, data) => {
      state.authData = data
      lsp.saveObject('authData', data)
    },
    AUTH_LOGOUT: state => {
      state.authData = null
      localStorage.removeItem('authData')
    },
    CLEAR_STORE: state => {
      state.authData = null
      localStorage.removeItem('authData')
      //Object.keys(state).forEach(key => (state[key] = null))
    },
  },
  actions: {
    AUTH_LOGIN: async ({ commit }, payload) => {
      const data = await Api.post('/auth/login', payload)
      commit('AUTH_LOGIN', data)
    },
    AUTH_LOGOUT: async ({ commit }) => {
      commit('AUTH_LOGOUT')
    },
  },
}
