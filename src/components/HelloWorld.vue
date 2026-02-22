<template>
  <site-header v-model="activeView" />

  <v-container class="fill-height d-flex align-start pt-8" max-width="1200">
    <div class="w-100">
      <v-sheet
        v-if="runningEvents.length > 0"
        class="running-timer-bar px-4 py-3 mb-4"
        color="primary"
        rounded="lg"
      >
        <div class="text-subtitle-1 font-weight-bold mb-2">Активные таймеры</div>
        <div class="d-flex flex-wrap ga-3">
          <v-chip
            v-for="event in runningEvents"
            :key="event.id"
            color="white"
            text-color="primary"
            variant="flat"
          >
            {{ event.name }} — {{ formatElapsed(event) }}
          </v-chip>
        </div>
      </v-sheet>

      <v-row v-if="activeView === 'profile'">
        <v-col cols="12">
          <v-card rounded="lg" variant="tonal">
            <v-card-title>Личный кабинет</v-card-title>
            <v-card-text class="d-flex flex-column ga-2">
              <div><strong>Пользователь:</strong> Demo User</div>
              <div><strong>Задач всего:</strong> {{ events.length }}</div>
              <div><strong>Запущено таймеров:</strong> {{ runningEvents.length }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else-if="activeView === 'timer'">
        <v-col cols="12">
          <day-events
            :events="events"
            :selected-date="selectedDate"
            @update:events="setAllEvents"
          />
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-calendar"
            rounded="lg"
            variant="tonal"
          >
            <event-calendar
              :events="events"
              :selected-date="selectedDate"
              @update:events="setAllEvents"
              @update:selected-date="setSelectedDate"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
  import DayEvents from './DayEvents.vue'
  import EventCalendar from './EventCalendar.vue'
  import SiteHeader from './SiteHeader.vue'

  export default {
    name: 'HelloWorld',
    components: { DayEvents, EventCalendar, SiteHeader },
    data: () => ({
      events: [],
      selectedDate: new Date(),
      activeView: 'timer',
      timerTick: Date.now(),
      ticker: null,
    }),
    computed: {
      runningEvents () {
        return this.events.filter(item => item.isRunning)
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
      setAllEvents (events) {
        this.events = [...events]
      },
      setSelectedDate (date) {
        this.selectedDate = new Date(date)
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
    },
  }
</script>

<style scoped>
.running-timer-bar {
  position: sticky;
  top: 76px;
  z-index: 20;
  color: white;
}
</style>
