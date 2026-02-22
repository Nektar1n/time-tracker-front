<template>
  <v-container class="py-6" max-width="1200">
    <v-row>
      <v-col cols="12" md="6">
        <v-card
          class="py-4"
          color="surface-variant"
          image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
          prepend-icon="mdi-calendar"
          rounded="lg"
          variant="tonal"
        >
          <event-calendar @change="setEvents" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <day-events :value="events" />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="pa-6" rounded="lg" variant="tonal">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h2 class="text-h5">Тайм-трекер задач</h2>
              <p class="text-medium-emphasis">Редактируйте описание и запускайте таймер для каждой задачи.</p>
            </div>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="addTask">
              Добавить задачу
            </v-btn>
          </div>

          <v-row v-if="tasks.length" class="ga-4">
            <v-col v-for="task in tasks" :key="task.id" cols="12" md="6">
              <v-card class="pa-4 h-100" border>
                <div class="d-flex justify-space-between align-start mb-2">
                  <v-text-field
                    v-model="task.title"
                    density="compact"
                    hide-details
                    label="Название задачи"
                    variant="outlined"
                  />
                  <v-btn
                    class="ml-2"
                    color="error"
                    icon="mdi-delete"
                    variant="text"
                    @click="removeTask(task.id)"
                  />
                </div>

                <v-textarea
                  v-model="task.description"
                  auto-grow
                  class="mb-4"
                  label="Описание задачи"
                  rows="3"
                  variant="outlined"
                />

                <div class="timer-box text-center py-6 mb-4">
                  {{ formatDuration(getTaskDuration(task)) }}
                </div>

                <div class="d-flex justify-center ga-2">
                  <v-btn
                    :color="task.isRunning ? 'warning' : 'success'"
                    :prepend-icon="task.isRunning ? 'mdi-pause' : 'mdi-play'"
                    @click="toggleTimer(task.id)"
                  >
                    {{ task.isRunning ? "Пауза" : "Старт" }}
                  </v-btn>
                  <v-btn color="secondary" prepend-icon="mdi-restart" @click="resetTimer(task.id)">
                    Сброс
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
          <v-alert v-else type="info" variant="tonal">
            Пока нет задач. Добавьте первую, чтобы начать учет времени.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
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
    now: Date.now(),
    timerInterval: null,
    taskSeed: 3,
    tasks: [
      {
        id: 1,
        title: "Подготовить отчет",
        description: "Собрать метрики по проекту и оформить краткий отчет.",
        elapsedMs: 0,
        startedAt: null,
        isRunning: false,
      },
      {
        id: 2,
        title: "Проверить баг-репорты",
        description: "Отметить актуальные проблемы и приоритизировать исправления.",
        elapsedMs: 0,
        startedAt: null,
        isRunning: false,
      },
    ],
  }),
  mounted() {
    this.timerInterval = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
  },
  methods: {
    setEvents(data) {
      this.events = data;
    },
    addTask() {
      this.tasks.push({
        id: this.taskSeed,
        title: `Новая задача #${this.taskSeed}`,
        description: "",
        elapsedMs: 0,
        startedAt: null,
        isRunning: false,
      });
      this.taskSeed += 1;
    },
    removeTask(id) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
    },
    toggleTimer(id) {
      const task = this.tasks.find((item) => item.id === id);
      if (!task) {
        return;
      }

      if (task.isRunning) {
        task.elapsedMs += this.now - task.startedAt;
        task.startedAt = null;
        task.isRunning = false;
      } else {
        task.startedAt = this.now;
        task.isRunning = true;
      }
    },
    resetTimer(id) {
      const task = this.tasks.find((item) => item.id === id);
      if (!task) {
        return;
      }

      task.elapsedMs = 0;
      task.startedAt = task.isRunning ? this.now : null;
    },
    getTaskDuration(task) {
      if (!task.isRunning || !task.startedAt) {
        return task.elapsedMs;
      }

      return task.elapsedMs + (this.now - task.startedAt);
    },
    formatDuration(duration) {
      const totalSeconds = Math.floor(duration / 1000);
      const hours = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (totalSeconds % 60).toString().padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    },
  },
};
</script>

<style scoped>
.timer-box {
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 16px;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1;
}
</style>
