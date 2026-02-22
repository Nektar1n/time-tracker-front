<template>
  <v-container class="fill-height d-flex align-center" max-width="1200">
    <div class="w-100">
      <transition-group
        name="active-timers-pop"
        tag="div"
        class="running-timer-popup-list"
      >
        <v-sheet
          v-for="event in activeEvents"
          :key="event.id"
          class="running-timer-popup px-4 py-3"
          color="surface"
          rounded="lg"
          @click="openEventEditor(event.id)"
        >
          <div class="d-flex align-center justify-space-between ga-3">
            <div class="d-flex align-center ga-2 running-event-main">
              <span
                class="running-event-dot"
                :style="{ backgroundColor: event.color || '#2196F3' }"
              />
              <div class="d-flex flex-column">
                <span class="font-weight-medium">{{ event.name }}</span>
                <small
                  v-if="event.details"
                  class="running-event-details"
                >
                  {{ event.details }}
                </small>
              </div>
            </div>
            <div class="d-flex align-center ga-1">
              <v-btn
                :icon="event.isRunning ? 'mdi-pause' : 'mdi-play'"
                size="x-small"
                :title="event.isRunning ? 'Поставить на паузу' : 'Продолжить таймер'"
                variant="text"
                @click.stop="toggleTimer(event.id)"
              />
              <v-btn
                icon="mdi-check"
                size="x-small"
                title="Завершить событие"
                variant="text"
                color="success"
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

      <v-row>
        <v-col cols="6">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-calendar"
            rounded="lg"
            variant="tonal"
          >
            <event-calendar
              ref="eventCalendarRef"
              :events="events"
              :scroll-sync="scrollSync"
              :selected-date="selectedDate"
              @sync-scroll="onSyncScroll"
              @update:events="onSetAllEvents"
              @update:selected-date="onSetSelectedDate"
            />
          </v-card>
        </v-col>
        <v-col cols="6">
          <day-events
            ref="dayEventsRef"
            :events="events"
            :scroll-sync="scrollSync"
            :selected-date="selectedDate"
            @sync-scroll="onSyncScroll"
            @update:events="onSetAllEvents"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
  import DayEvents from './DayEvents.vue'
  import EventCalendar from './EventCalendar.vue'
  import {
    completeEventById,
    setAllEvents,
    setSelectedDate,
    state,
    syncScroll,
    toggleTimerById,
  } from '@/modules/timers/timerState'

  export default {
    name: 'HelloWorld',
    components: { DayEvents, EventCalendar },
    data: () => ({
      timerTick: Date.now(),
      ticker: null,
    }),
    computed: {
      events () {
        return state.events
      },
      selectedDate () {
        return state.selectedDate
      },
      scrollSync () {
        return state.scrollSync
      },
      activeEvents () {
        return this.events.filter(
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
      onSetAllEvents (events) {
        setAllEvents(events)
      },
      onSetSelectedDate (date) {
        setSelectedDate(date)
      },
      onSyncScroll (payload) {
        syncScroll(payload)
      },
      openEventEditor (eventId) {
        this.$refs.dayEventsRef?.openEditEventById(eventId)
      },
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
        const totalSeconds = Math.max(
          0,
          Math.floor(this.getElapsedMs(event) / 1000),
        )
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
  top: 16px;
  right: 16px;
  z-index: 120;
  width: min(500px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.running-timer-popup {
  border: 1px solid rgb(var(--v-theme-surface-variant));
  opacity: 0.72;
  backdrop-filter: blur(2px);
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.running-timer-popup:hover {
  opacity: 1;
}

.running-event-main {
  min-width: 0;
}

.running-event-details {
  color: rgb(var(--v-theme-on-surface-variant));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.running-event-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.running-timer-value {
  font-size: 16px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.6px;
  min-width: 84px;
  text-align: right;
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

.active-timers-pop-enter-active,
.active-timers-pop-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.active-timers-pop-enter-from,
.active-timers-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
