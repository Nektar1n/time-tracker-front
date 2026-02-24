<template>
  <div v-if="isVisible" class="running-timer-popup-list">
    <v-btn
      class="running-timer-collapse-btn"
      color="primary"
      :prepend-icon="arePopupsCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
      size="small"
      variant="elevated"
      @click.stop="togglePopups"
    >
      {{ arePopupsCollapsed ? 'Показать таймеры' : 'Скрыть таймеры' }}
    </v-btn>

    <transition-group
      v-if="!arePopupsCollapsed"
      name="active-timers-pop"
      tag="div"
    >
      <v-sheet
        v-for="event in activeEvents"
        :key="event.id"
        class="running-timer-popup px-3 py-2"
        color="surface"
        rounded="lg"
        @click="openEvent(event.id)"
      >
        <div class="running-event-content">
          <div class="d-flex align-center ga-2 running-event-main">
            <span
              class="running-event-dot"
              :style="{ backgroundColor: event.color || '#2196F3' }"
            />
            <div class="running-event-text">
              <span class="font-weight-medium running-event-title">{{ event.name }}</span>
              <div class="running-event-details-wrap">
                <small
                  v-if="event.details"
                  class="running-event-details"
                >
                  {{ event.details }}
                </small>
                <small
                  v-if="categoryLabel(event)"
                  class="running-event-details"
                >
                  {{ categoryLabel(event) }}
                </small>
              </div>
            </div>
          </div>

          <div class="d-flex align-center ga-1 running-event-controls">
            <v-btn
              :icon="event.isRunning ? 'mdi-pause' : 'mdi-play'"
              size="x-small"
              :title="event.isRunning ? 'Поставить на паузу' : 'Продолжить таймер'"
              variant="text"
              @click.stop="toggleTimer(event.id)"
            />
            <v-btn
              color="success"
              icon="mdi-check"
              size="x-small"
              title="Завершить событие"
              variant="text"
              @click.stop="completeEvent(event.id)"
            />
            <div
              class="running-timer-value"
              :style="{ color: event.color || '#2196F3' }"
            >
              {{ formatElapsed(event) }}
            </div>
          </div>
        </div>
      </v-sheet>
    </transition-group>
  </div>
</template>

<script>
  import { getCategoryById } from '@/modules/categories/categoryState'
  import { completeEventById, state, toggleTimerById } from '@/modules/timers/timerState'

  export default {
    name: 'RunningTimersPopup',
    data: () => ({
      timerTick: Date.now(),
      ticker: null,
      pendingCompletion: {},
      arePopupsCollapsed: false,
    }),
    computed: {
      events () {
        return state.events
      },
      activeEvents () {
        return this.events.filter(
          item => !item.isCompleted && (item.isRunning || (item.elapsedMs || 0) > 0),
        )
      },
      isVisible () {
        return this.$route.path !== '/active-timers' && this.activeEvents.length > 0
      },
    },
    watch: {
      activeEvents: {
        deep: true,
        handler (value) {
          const activeIds = new Set(value.map(item => item.id))
          this.collapsedEvents = Object.fromEntries(
            Object.entries(this.collapsedEvents).filter(([id]) => activeIds.has(Number(id))),
          )
        },
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
      openEvent () {
        this.$router.push('/active-timers')
      },
      togglePopups () {
        this.arePopupsCollapsed = !this.arePopupsCollapsed
      },
      toggleTimer (eventId) {
        toggleTimerById(eventId)
      },
      completeEvent (eventId) {
        if (!this.pendingCompletion[eventId]) {
          this.pendingCompletion[eventId] = true
          setTimeout(() => {
            this.pendingCompletion[eventId] = false
          }, 1800)
          return
        }

        this.pendingCompletion[eventId] = false
        completeEventById(eventId)
      },
      getElapsedMs (event) {
        const elapsed = event?.elapsedMs || 0
        if (event?.isRunning && event?.timerStartedAt) {
          return elapsed + (this.timerTick - event.timerStartedAt)
        }
        return elapsed
      },
      categoryLabel (event) {
        const category = getCategoryById(event?.categoryId)
        return category ? `${category.emoji} ${category.name}` : ''
      },
      formatElapsed (event) {
        const totalSeconds = Math.max(0, Math.floor(this.getElapsedMs(event) / 1000))
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
        const s = String(totalSeconds % 60).padStart(2, '0')
        return `${h}:${m}:${s}`
      },
    },
  }
</script>

<style scoped>
.running-timer-popup-list {
  position: fixed;
  top: calc(var(--v-layout-top, 64px) + 12px);
  right: 16px;
  z-index: 120;
  width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.running-timer-collapse-btn {
  align-self: flex-end;
}

.running-timer-popup {
  border: 1px solid rgb(var(--v-theme-surface-variant));
  opacity: 0.78;
  backdrop-filter: blur(2px);
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.running-timer-popup:hover {
  opacity: 1;
}

.running-event-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.running-event-main {
  min-width: 0;
  flex: 1;
}

.running-event-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.running-event-title,
.running-event-details {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.running-event-details-wrap {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.running-event-details {
  color: rgb(var(--v-theme-on-surface-variant));
}

.running-event-controls {
  flex-shrink: 0;
}

.running-event-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.running-timer-value {
  font-size: 15px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.4px;
  min-width: 78px;
  text-align: right;
}

.timer-details-expand-enter-active,
.timer-details-expand-leave-active {
  transition: max-height 0.22s ease, opacity 0.18s ease, transform 0.18s ease;
  max-height: 50px;
}

.timer-details-expand-enter-from,
.timer-details-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-2px);
}

.active-timers-pop-enter-active,
.active-timers-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.active-timers-pop-enter-from,
.active-timers-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
