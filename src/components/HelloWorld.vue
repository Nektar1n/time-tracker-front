<template>
  <v-container class="fill-height d-flex align-center" max-width="1200">
    <div class="w-100">
      <v-sheet
        v-if="activeEvents.length > 0"
        class="running-timer-bar px-4 py-3 mb-4"
        color="surface"
        rounded="lg"
      >
        <div class="d-flex flex-column ga-1">
          <div class="text-subtitle-1 font-weight-bold">
            Активные таймеры ({{ activeEvents.length }})
          </div>
          <div
            v-for="event in activeEvents"
            :key="event.id"
            class="running-event-row d-flex align-center justify-space-between ga-4"
            :style="{ borderLeftColor: event.color || '#2196F3' }"
            @click="openEventEditor(event.id)"
          >
            <div class="d-flex align-center ga-2">
              <v-btn
                :icon="event.isRunning ? 'mdi-pause' : 'mdi-play'"
                :title="event.isRunning ? 'Поставить на паузу' : 'Продолжить таймер'"
                size="x-small"
                variant="text"
                @click.stop="toggleTimer(event.id)"
              />
              <span
                class="running-event-dot"
                :style="{ backgroundColor: event.color || '#2196F3' }"
              />
              <span>{{ event.name }}</span>
            </div>
            <div
              class="running-timer-value"
              :style="{ color: event.color || '#2196F3' }"
            >
              {{ formatElapsed(event) }}
            </div>
          </div>
        </div>
      </v-sheet>

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
              :events="events"
              :selected-date="selectedDate"
              @update:events="setAllEvents"
              @update:selected-date="setSelectedDate"
            />
          </v-card>
        </v-col>
        <v-col cols="6">
          <day-events
            ref="dayEventsRef"
            :events="events"
            :selected-date="selectedDate"
            @update:events="setAllEvents"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import DayEvents from "./DayEvents.vue";
import EventCalendar from "./EventCalendar.vue";

export default {
  name: "HelloWorld",
  components: { DayEvents, EventCalendar },
  data: () => ({
    events: [],
    selectedDate: new Date(),
    timerTick: Date.now(),
    ticker: null,
  }),
  computed: {
    activeEvents() {
      return this.events.filter(
        (item) => !item.isCompleted && (item.isRunning || (item.elapsedMs || 0) > 0),
      );
    },
  },
  mounted() {
    this.ticker = setInterval(() => {
      this.timerTick = Date.now();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.ticker);
  },
  methods: {
    setAllEvents(events) {
      this.events = [...events];
    },
    setSelectedDate(date) {
      this.selectedDate = new Date(date);
    },
    openEventEditor(eventId) {
      this.$refs.dayEventsRef?.openEditEventById(eventId);
    },
    pauseEvent(event) {
      if (!event?.isRunning) return event;
      return {
        ...event,
        elapsedMs: (event.elapsedMs || 0) + (Date.now() - event.timerStartedAt),
        timerStartedAt: null,
        isRunning: false,
      };
    },
    toggleTimer(eventId) {
      const idx = this.events.findIndex((item) => item.id === eventId);
      if (idx === -1) return;

      const current = { ...this.events[idx] };
      if (current.isCompleted) return;

      const updated = current.isRunning
        ? this.pauseEvent(current)
        : { ...current, timerStartedAt: Date.now(), isRunning: true };

      this.events.splice(idx, 1, updated);
    },
    getElapsedMs(event) {
      const elapsed = event?.elapsedMs || 0;
      if (event?.isRunning && event?.timerStartedAt) {
        return elapsed + (this.timerTick - event.timerStartedAt);
      }
      return elapsed;
    },
    formatElapsed(event) {
      const totalSeconds = Math.max(
        0,
        Math.floor(this.getElapsedMs(event) / 1000),
      );
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const s = String(totalSeconds % 60).padStart(2, "0");
      return `${h}:${m}:${s}`;
    },
  },
};
</script>

<style scoped>
.running-timer-bar {
  position: sticky;
  top: 8px;
  z-index: 20;
  border: 1px solid rgb(var(--v-theme-surface-variant));
}

.running-event-row {
  border-left: 4px solid;
  border-radius: 8px;
  padding: 6px 10px;
  border-bottom: 0.5px solid;
  border-top: 0.5px solid;
  border-right: 0.5px solid;
  cursor: pointer;
}

.running-event-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.running-timer-value {
  font-size: 20px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 1px;
}
</style>
