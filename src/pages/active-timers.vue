<template>
  <v-container class="py-6" max-width="1200">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2>Активные таймеры</h2>
      <div class="text-medium-emphasis">Всего: {{ activeEvents.length }}</div>
    </div>

    <v-alert
      v-if="activeEvents.length === 0"
      text="Сейчас нет активных таймеров"
      type="info"
      variant="tonal"
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
            <span class="font-weight-bold" :style="{ color: event.color || '#2196F3' }">
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
            <v-btn
              prepend-icon="mdi-pencil"
              variant="text"
              @click="openEdit(event)"
            >
              Редактировать
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

    <v-dialog v-model="isEditOpen" max-width="500">
      <v-card>
        <v-card-title>Редактирование события</v-card-title>
        <v-card-text class="d-flex flex-column ga-3">
          <v-text-field v-model="draftEvent.name" label="Название" />
          <v-textarea v-model="draftEvent.details" label="Описание" rows="3" />
          <v-text-field v-model="draftEvent.color" label="Цвет (hex или css)" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isEditOpen = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveEvent">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="completeWarningOpen"
      color="warning"
      timeout="1800"
    >
      Нажмите «Завершить» ещё раз, чтобы подтвердить
    </v-snackbar>
  </v-container>
</template>

<script>
  import { completeEventById, state, toggleTimerById, updateEventById } from '@/modules/timers/timerState'

  export default {
    name: 'ActiveTimersPage',
    data: () => ({
      timerTick: Date.now(),
      ticker: null,
      isEditOpen: false,
      draftEvent: {},
      pendingCompletion: {},
      completeWarningOpen: false,
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
        if (!this.pendingCompletion[eventId]) {
          this.pendingCompletion[eventId] = true
          this.completeWarningOpen = true
          setTimeout(() => {
            this.pendingCompletion[eventId] = false
          }, 1800)
          return
        }

        this.pendingCompletion[eventId] = false
        completeEventById(eventId)
      },
      openEdit (event) {
        this.draftEvent = {
          id: event.id,
          name: event.name,
          details: event.details || '',
          color: event.color || '#2196F3',
        }
        this.isEditOpen = true
      },
      saveEvent () {
        updateEventById(this.draftEvent.id, {
          name: this.draftEvent.name,
          details: this.draftEvent.details,
          color: this.draftEvent.color,
        })
        this.isEditOpen = false
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
