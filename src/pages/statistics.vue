<template>
  <v-container class="py-6" max-width="1400">
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 h-100" rounded="lg">
          <div class="text-h6 mb-3">История действий</div>
          <v-list class="overflow-y-auto" lines="two" max-height="70vh">
            <v-list-item
              v-for="entry in actionLogs"
              :key="entry.id"
            >
              <v-list-item-title>{{ actionLabel(entry.action) }} — {{ entry.eventName }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatDateTime(entry.at) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="actionLogs.length === 0">
              <v-list-item-title>Пока нет действий</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4" rounded="lg">
          <div class="text-h6 mb-4">Статистика действий</div>
          <div v-for="item in actionStats" :key="item.key" class="mb-4">
            <div class="d-flex justify-space-between mb-1">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <v-progress-linear color="primary" height="12" :model-value="item.percent" rounded />
          </div>
        </v-card>

        <v-card class="pa-4" rounded="lg">
          <div class="text-h6 mb-4">Время работы</div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Суммарно отработано</span>
            <strong>{{ formatDuration(totalWorkedMs) }}</strong>
          </div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Активных событий</span>
            <strong>{{ activeEventsCount }}</strong>
          </div>
          <div class="d-flex justify-space-between align-center">
            <span>Завершённых событий</span>
            <strong>{{ completedEventsCount }}</strong>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { state } from '@/modules/timers/timerState'

  export default {
    name: 'StatisticsPage',
    data: () => ({
      timerTick: Date.now(),
      ticker: null,
    }),
    computed: {
      actionLogs () {
        return state.actionLogs
      },
      actionStats () {
        const total = Math.max(1, this.actionLogs.length)
        const starts = this.actionLogs.filter(item => item.action === 'start').length
        const pauses = this.actionLogs.filter(item => item.action === 'pause').length
        const completes = this.actionLogs.filter(item => item.action === 'complete').length

        return [
          { key: 'start', label: 'Начал', value: starts, percent: (starts / total) * 100 },
          { key: 'pause', label: 'Пауза', value: pauses, percent: (pauses / total) * 100 },
          { key: 'complete', label: 'Завершил', value: completes, percent: (completes / total) * 100 },
        ]
      },
      totalWorkedMs () {
        return state.events.reduce((sum, event) => {
          const elapsed = event.elapsedMs || 0
          if (event.isRunning && event.timerStartedAt) {
            return sum + elapsed + (this.timerTick - event.timerStartedAt)
          }
          return sum + elapsed
        }, 0)
      },
      activeEventsCount () {
        return state.events.filter(item => !item.isCompleted && (item.isRunning || (item.elapsedMs || 0) > 0)).length
      },
      completedEventsCount () {
        return state.events.filter(item => item.isCompleted).length
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
      actionLabel (value) {
        if (value === 'start') return 'Начал'
        if (value === 'pause') return 'Поставил на паузу'
        return 'Завершил'
      },
      formatDateTime (value) {
        return new Date(value).toLocaleString()
      },
      formatDuration (ms) {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000))
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
        const s = String(totalSeconds % 60).padStart(2, '0')
        return `${h}:${m}:${s}`
      },
    },
  }
</script>
