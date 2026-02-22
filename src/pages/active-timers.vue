<template>
  <v-container max-width="1200" class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2>Активные таймеры</h2>
      <div class="text-medium-emphasis">Всего: {{ activeEvents.length }}</div>
    </div>

    <v-alert
      v-if="activeEvents.length === 0"
      type="info"
      variant="tonal"
      text="Сейчас нет активных таймеров"
    />

    <v-row v-else>
      <v-col
        v-for="event in activeEvents"
        :key="event.id"
        cols="12"
        md="6"
      >
        <v-card :border="`start ${event.color || '#2196F3'} 6`" rounded="lg">
          <v-card-title class="d-flex justify-space-between align-center ga-2">
            <span class="text-truncate">{{ event.name }}</span>
            <span :style="{ color: event.color || '#2196F3' }" class="font-weight-bold">
              {{ formatElapsed(event) }}
            </span>
          </v-card-title>
          <v-card-text>
            <div class="text-body-2 mb-2">{{ event.details || 'Без описания' }}</div>
            <div class="text-caption text-medium-emphasis">
              Старт: {{ formatDateTime(event.start) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Завершение: {{ formatDateTime(event.end) }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              :prepend-icon="event.isRunning ? 'mdi-pause' : 'mdi-play'"
              variant="text"
              @click="toggleTimer(event.id)"
            >
              {{ event.isRunning ? 'Пауза' : 'Продолжить' }}
            </v-btn>
            <v-spacer />
            <v-btn
              color="success"
              prepend-icon="mdi-check"
              variant="text"
              @click="completeEvent(event.id)"
            >
              Завершить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { completeEventById, state, toggleTimerById } from '@/modules/timers/timerState'

  export default {
    name: 'ActiveTimersPage',
    data: () => ({
      timerTick: Date.now(),
      ticker: null,
    }),
    computed: {
      activeEvents () {
        return state.events.filter(
          item => !item.isCompleted && (item.isRunning || (item.elapsedMs || 0) > 0),
        )
      },
    },
    mounted () {
      this.ticker = setInterval(() => {
        this.timerTick = Date.now()
      }, 1000)
    },
    beforeUnmount () {
      clearInterval(this.ticker)
    },
    methods: {
      toggleTimer (eventId) {
        toggleTimerById(eventId)
      },
      completeEvent (eventId) {
        completeEventById(eventId)
      },
      getElapsedMs (event) {
        const elapsed = event?.elapsedMs || 0
        if (event?.isRunning && event?.timerStartedAt) {
          return elapsed + (this.timerTick - event.timerStartedAt)
        }
        return elapsed
      },
      formatElapsed (event) {
        const totalSeconds = Math.max(0, Math.floor(this.getElapsedMs(event) / 1000))
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
        const s = String(totalSeconds % 60).padStart(2, '0')
        return `${h}:${m}:${s}`
      },
      formatDateTime (value) {
        const date = new Date(value)
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
      },
    },
  }
</script>
