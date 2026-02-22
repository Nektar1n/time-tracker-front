import Modal from '@/modules/modals/Modal.class.js'
import AuthComponent from '@/modules/auth/AuthComponent.vue'
import { computed } from 'vue'
import store from '@/store'

let authModal = new Modal('authModal').component(AuthComponent)

export function useAuthDrawer() {
  const authWindow = async () => (authModal.async = await authModal.openAsync())

  const login = async payload =>
    await store.dispatch('authStore/AUTH_LOGIN', payload)

  const logout = async () => await store.dispatch('authStore/AUTH_LOGOUT')

  const userToken = computed(() => store.getters['authStore/userToken'])

  const userName = computed(() => store.getters['authStore/userName'])

  const userRoles = computed(() => store.getters['authStore/userRoles'])

  const loggedIn = computed(() => store.getters['authStore/userToken'] !== null)

  const canAccess = role =>
    computed(() =>
      userRoles.value
        .map(({ value }) => value)
        .reduce((acc, item) => {
          if (role.find(i => i.toUpperCase() === item.toUpperCase())) {
            acc = true
          }
          return acc
        }, false)
    )

  return {
    canAccess,
    loggedIn,
    logout,
    login,
    userToken,
    userName,
    userRoles,
    authModal,
    authWindow,
  }
}
