import { useStore } from 'vuex'
import { computed } from 'vue'

export function useUserDrawer() {
  const store = useStore()

  const loading = computed({
    get() {
      return store.getters['userStore/loading']
    },
    set(v) {
      store.commit('userStore/TOGGLE_LOADING', v)
    },
  })

  const rolesList = [
    {
      id: 1,
      value: 'ADMIN',
      name: 'Администратор',
      description: 'Максимальные права в системе',
    },
    {
      id: 2,
      value: 'EXPERT',
      name: 'Эксперт',
      description: 'Управление экспертизами',
    },
    {
      id: 3,
      value: 'HEAD',
      name: 'Руководитель',
      description: 'Руководитель по всем направлениям',
    },
  ]

  const renderKey = computed({
    get() {
      return store.getters['userStore/renderKey']
    },
    set(v) {
      store.commit('userStore/TOGGLE_RENDER_KEY', v)
    },
  })

  const initUserList = async () => {
    try {
      loading.value = true
      await store.dispatch('userStore/INIT_USER_LIST')
    } finally {
      loading.value = false
    }
  }

  const userList = computed(() => store.getters['userStore/userList'])

  const updateUser = async payload =>
    await store.dispatch('userStore/UPDATE_USER', payload)

  const appendUser = async payload =>
    await store.dispatch('userStore/ADD_USER', payload)

  const getUserInfo = async payload =>
    await store.dispatch('userStore/AUTH_GET_USER_INFO', payload)

  const userInfo = computed(() => store.getters['userStore/userInfo'])

  /**
   * этот метод используется при создании пользователя
   * @param payload
   * @returns {Promise<any>}
   */
  const resetPassword = async payload =>
    await store.dispatch('userStore/AUTH_RESET_PASSWORD', payload)

  /**
   * а этот - для сброса пароля из карточки клиента
   * @param payload
   * @returns {Promise<any>}
   */
  const newPasswordRequest = async payload =>
    await store.dispatch('userStore/GENERATE_RESET_PASSWORD_TOKEN', payload)

  const resetData = computed(() => store.getters['userStore/resetData'])

  return {
    resetData,
    newPasswordRequest,
    resetPassword,
    userInfo,
    getUserInfo,
    appendUser,
    updateUser,
    userList,
    initUserList,
    renderKey,
    rolesList,
    loading,
  }
}
