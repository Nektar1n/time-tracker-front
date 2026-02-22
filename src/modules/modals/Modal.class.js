import { ref, watch } from 'vue'

export default class Modal {
  #st = ref(false)
  #tit = null
  #persist = ref(false)
  #mw = 600
  #fls = false
  #hO = false
  #cmp = null
  #dt = ref(null)
  #ldg = ref(false)
  #async = ref(false)

  constructor(title) {
    this.#title = title
  }

  get async() {
    return this.#async.value
  }
  set async(value) {
    this.#async.value = value
  }

  get loading() {
    return this.#ldg.value
  }
  set loading(value) {
    this.#ldg.value = value
  }

  get getData() {
    return this.#dt
  }

  get cmp() {
    return this.#cmp
  }

  get hideOverlay() {
    return this.#hO
  }

  get fullscreen() {
    return this.#fls
  }

  get maxWidth() {
    return this.#mw
  }

  get title() {
    return this.#tit
  }
  set #title(title) {
    this.#tit = title
  }

  get persistent() {
    return this.#persist.value
  }
  set #persistent(persistent) {
    this.#persist.value = persistent
  }

  get state() {
    return this.#st.value
  }
  set #state(state) {
    this.#st.value = state
  }

  component(c = null) {
    this.#cmp = c
    return this
  }

  data(data) {
    this.#dt = data
    return this
  }

  open(
    o = {
      persistent: false,
      maxWidth: 600,
      fullscreen: false,
      hideOverlay: false,
    }
  ) {
    this.#state = true
    this.#persistent = o.persistent ?? false
    this.#mw = o.maxWidth ?? 600
    this.#fls = o.fullscreen ?? false
    this.#hO = o.hideOverlay ?? false
    return this
  }

  async openAsync() {
    this.open({ persistent: true })
    this.loading = false
    return new Promise(resolve => {
      watch(
        () => this.async,
        f => {
          if (f) resolve(f)
        }
      )
    })
  }

  close() {
    this.#state = false
    this.#async.value = true
    return this
  }
}
