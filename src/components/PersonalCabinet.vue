<template>
  <v-card class="h-100" variant="outlined">
    <v-card-title class="d-flex align-center ga-2">
      <v-icon icon="mdi-account-cog" />
      Личный кабинет календаря
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="displayName"
        label="Ваше имя"
        prepend-inner-icon="mdi-account"
        variant="outlined"
      />

      <v-text-field
        v-model="calendarId"
        class="mt-2"
        label="ID календаря"
        prepend-inner-icon="mdi-calendar"
        variant="outlined"
      />

      <div class="d-flex ga-2 flex-wrap">
        <v-btn color="primary" prepend-icon="mdi-link-variant" @click="generateShareLink">
          Сформировать ссылку
        </v-btn>
        <v-btn
          :color="connected ? 'error' : 'success'"
          :prepend-icon="connected ? 'mdi-lan-disconnect' : 'mdi-lan-connect'"
          @click="toggleConnection"
        >
          {{ connected ? 'Отключиться' : 'Подключиться' }}
        </v-btn>
      </div>

      <v-alert
        v-if="shareLink"
        class="mt-4"
        density="comfortable"
        type="info"
        variant="tonal"
      >
        <div class="text-caption">Ссылка для совместной работы:</div>
        <a :href="shareLink">{{ shareLink }}</a>
      </v-alert>

      <v-alert
        v-if="connectionError"
        class="mt-3"
        density="comfortable"
        type="warning"
        variant="tonal"
      >
        {{ connectionError }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
  import { setAllEvents, setSelectedDate, state } from '@/modules/timers/timerState'

  export default {
    name: 'PersonalCabinet',
    emits: ['users-update'],
    data: () => ({
      socket: null,
      ioFactory: null,
      connected: false,
      connectionError: '',
      displayName: '',
      shareLink: '',
      calendarId: '',
      suppressBroadcast: false,
    }),
    computed: {
      events () {
        return state.events
      },
      selectedDate () {
        return state.selectedDate
      },
    },
    watch: {
      events: {
        deep: true,
        handler (value) {
          this.broadcastState({ events: value, selectedDate: this.selectedDate })
        },
      },
      selectedDate (value) {
        this.broadcastState({ events: this.events, selectedDate: value })
      },
    },
    mounted () {
      const url = new URL(window.location.href)
      this.calendarId = url.searchParams.get('calendar') || crypto.randomUUID()
      this.displayName = localStorage.getItem('calendar-user-name') || 'Гость'
      this.generateShareLink()
    },
    beforeUnmount () {
      this.disconnectSocket()
    },
    methods: {
      generateShareLink () {
        const safeId = this.calendarId?.trim() || crypto.randomUUID()
        this.calendarId = safeId
        const url = new URL(window.location.href)
        url.searchParams.set('calendar', safeId)
        this.shareLink = url.toString()
        window.history.replaceState({}, '', `${url.pathname}${url.search}`)
      },
      toggleConnection () {
        if (this.connected) {
          this.disconnectSocket()
          return
        }

        this.connectSocket()
      },
      async connectSocket () {
        this.connectionError = ''
        localStorage.setItem('calendar-user-name', this.displayName)

        if (!this.ioFactory) {
          const socketModule = await import('https://cdn.socket.io/4.8.1/socket.io.esm.min.js')
          this.ioFactory = socketModule.io
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
        this.socket = this.ioFactory(socketUrl, {
          transports: ['websocket'],
          autoConnect: true,
        })

        this.socket.on('connect', () => {
          this.connected = true
          this.socket.emit('calendar:join', {
            calendarId: this.calendarId,
            name: this.displayName,
          })
          this.broadcastState({
            events: this.events,
            selectedDate: this.selectedDate,
          })
        })

        this.socket.on('calendar:users', users => {
          this.$emit('users-update', users)
        })

        this.socket.on('calendar:state', payload => {
          this.suppressBroadcast = true
          setAllEvents(payload.events || [])
          if (payload.selectedDate) {
            setSelectedDate(new Date(payload.selectedDate))
          }
          setTimeout(() => {
            this.suppressBroadcast = false
          }, 0)
        })

        this.socket.on('disconnect', () => {
          this.connected = false
        })

        this.socket.on('connect_error', err => {
          this.connectionError = `Не удалось подключиться к сокету: ${err.message}`
          this.connected = false
        })
      },
      disconnectSocket () {
        if (!this.socket) {
          return
        }

        this.socket.disconnect()
        this.socket = null
        this.connected = false
        this.$emit('users-update', [])
      },
      broadcastState ({ events, selectedDate }) {
        if (!this.socket || !this.connected || this.suppressBroadcast) {
          return
        }

        this.socket.emit('calendar:state', {
          calendarId: this.calendarId,
          events,
          selectedDate,
        })
      },
    },
  }
</script>
