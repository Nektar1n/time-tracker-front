import Api from '@/libs/apiCall.js'

export default {
  namespaced: true,
  namespace: 'users',
  state: () => ({
    loading: false,
    renderKey: 0,
    userList: null,
    userInfo: null,
    resetData: null,
  }),
  getters: {
    loading: state => state.loading,
    renderKey: state => state.renderKey,
    userList: state => state.userList || [],
    userInfo: state => state.userInfo || {},
    resetData: state => state.resetData || '',
  },
  mutations: {
    TOGGLE_LOADING: (state, payload) => {
      state.loading = payload
    },
    TOGGLE_RENDER_KEY: (state, payload) => {
      state.renderKey += payload
    },
    INIT_USER_LIST: (state, payload) => {
      state.userList = payload
    },
    UPDATE_USER: (state, payload) => {
      const index = state.userList.findIndex(u => u.id === payload.id)
      if (index !== -1) {
        state.userList[index] = payload
      }
    },
    ADD_USER: (state, payload) => {
      state.userList.push(payload)
    },
    SET_USER_INFO: (state, payload) => {
      state.userInfo = { ...payload }
    },
    RESET_DATA: (state, payload) => {
      state.resetData = payload
    },
    CLEAR_STORE: state => {
      state.loading = false
      state.renderKey = 0
      state.userList = null
      state.userInfo = null
      state.resetData = null
      // Object.keys(state).forEach(key => (state[key] = null))
    },
  },
  actions: {
    GENERATE_RESET_PASSWORD_TOKEN: async ({ commit }, userID) => {
      const data = await Api.post(
        `users/${userID}/generate-reset-password-token`,
      )
      commit('RESET_DATA', data)
    },
    AUTH_RESET_PASSWORD: async (_, { token, password }) => {
      await Api.post(`/auth/reset-password/${token}`, { password })
    },
    AUTH_GET_USER_INFO: async ({ commit }, payload) => {
      const data = await Api.get(`/auth/get-user-info/${payload}`)
      commit('SET_USER_INFO', data)
    },
    ADD_USER: async ({ commit }, payload) => {
      const data = await Api.post(`/users`, payload)
      commit('ADD_USER', data)
    },
    UPDATE_USER: async ({ commit }, payload) => {
      const data = await Api.post('/users/update-user', payload)
      commit('UPDATE_USER', data)
    },
    INIT_USER_LIST: async ({ commit }) => {
      const data = await Api.get('/users')
      commit('INIT_USER_LIST', data)
    },
  },
}
