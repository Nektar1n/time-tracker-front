import { reactive, shallowRef } from 'vue'

export class ModalManager {
  constructor () {
    this.modals = reactive({})
    this.currentModal = reactive({
      data: null,
      visible: false,
      settings: {},
    })
  }

  addModal (
    key,
    options = {
      loading: false,
      disabled: false,
      component: null,
      persistent: false,
      maxWidth: null,
      fullScreen: false,
      buttonOK: { title: 'ОК', action: null, show: true },
      title: null,
      props: null,
    },
  ) {
    this.modals[key] = {
      key,
      component: shallowRef(options.component),
      loading: options.loading || false,
      disabled: options.disabled || false,
      persistent: options.persistent || false,
      maxWidth: options.maxWidth || 600,
      fullScreen: options.fullScreen || false,
      buttonOK: options.buttonOK || { title: 'ОК', action: null, show: true },
      title: options.title || null,
      props: options.props || null,
    }
  }

  open (key, data = null) {
    const modal = this.modals[key]
    this.currentModal.settings.loading = modal.loading
    this.currentModal.settings.disabled = modal.disabled
    this.currentModal.settings.persistent = modal.persistent
    this.currentModal.settings.component = shallowRef(modal.component)
    this.currentModal.settings.maxWidth = modal.maxWidth
    this.currentModal.settings.fullScreen = modal.fullScreen
    this.currentModal.settings.buttonOK = modal.buttonOK
    this.currentModal.settings.title = modal.title
    this.currentModal.settings.props = modal.props
    this.currentModal.settings.data = data
    this.currentModal.visible = true
  }

  close () {
    this.currentModal.visible = false
    setTimeout(() => (this.currentModal.settings = {}), 200)
  }

  get props () {
    return this.currentModal.settings.props
  }
  // set props(disabled) {
  //   this.currentModal.settings.disabled = disabled
  // }

  get disabled () {
    return this.currentModal.settings.disabled
  }

  set disabled (disabled) {
    this.currentModal.settings.disabled = disabled
  }

  get data () {
    return this.currentModal.settings.data
  }

  set data (data) {
    this.currentModal.settings.data = data
  }

  get loading () {
    return this.currentModal.settings.loading
  }

  set loading (loading) {
    this.currentModal.settings.loading = loading
    this.currentModal.settings.persistent = loading
  }

  get persistent () {
    return this.currentModal.settings.persistent
  }

  set persistent (persistent) {
    this.currentModal.settings.persistent = persistent
  }
}
