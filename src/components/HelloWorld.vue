<template>
  <v-container class="py-6" max-width="1400">
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
          <event-calendar
            :events="calendarEvents"
            :selected-date="selectedDate"
            @update:selected-date="selectedDate = $event"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-6" rounded="lg" variant="tonal">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h2 class="text-h5">Задачи на {{ selectedDateLabel }}</h2>
              <p class="text-medium-emphasis">
                Редактируйте событие и описание справа — изменения сразу отобразятся в календаре слева.
              </p>
            </div>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="addTask">
              Добавить задачу
            </v-btn>
          </div>

          <v-row v-if="dayTasks.length" class="ga-4">
            <v-col v-for="task in dayTasks" :key="task.id" cols="12">
              <v-card class="pa-4" border>
                <v-text-field
                  v-model="task.title"
                  class="mb-2"
                  density="compact"
                  hide-details
                  label="Название события"
                  variant="outlined"
                />

                <v-textarea
                  v-model="task.description"
                  auto-grow
                  class="mb-3"
                  label="Описание задачи"
                  rows="2"
                  variant="outlined"
                />

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="task.startInput"
                      label="Начало"
                      type="datetime-local"
                      variant="outlined"
                      @update:model-value="updateTaskTime(task, 'start', $event)"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="task.endInput"
                      label="Окончание"
                      type="datetime-local"
                      variant="outlined"
                      @update:model-value="updateTaskTime(task, 'end', $event)"
                    />
                  </v-col>
                </v-row>

                <div class="timer-box text-center py-5 mb-4">
                  {{ formatDuration(getTaskDuration(task)) }}
                </div>

                <div class="d-flex ga-2 flex-wrap">
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
                  <v-btn color="error" prepend-icon="mdi-delete" variant="tonal" @click="removeTask(task.id)">
                    Удалить
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert v-else type="info" variant="tonal">
            На выбранную дату задач нет. Нажмите «Добавить задачу».
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import EventCalendar from "./EventCalendar.vue";

export default {
  name: "HelloWorld",
  components: { EventCalendar },
  data: () => ({
    selectedDate: new Date().toISOString().split("T")[0],
    now: Date.now(),
    timerInterval: null,
    taskSeed: 3,
    tasks: [
      {
        id: 1,
        title: "Подготовить отчет",
        description: "Собрать метрики по проекту и оформить краткий отчет.",
        start: new Date(),
        end: new Date(Date.now() + 60 * 60 * 1000),
        startInput: "",
        endInput: "",
        elapsedMs: 0,
        startedAt: null,
        isRunning: false,
        color: "blue",
      },
      {
        id: 2,
        title: "Проверить баг-репорты",
        description: "Отметить актуальные проблемы и приоритизировать исправления.",
        start: new Date(Date.now() + 2 * 60 * 60 * 1000),
        end: new Date(Date.now() + 3 * 60 * 60 * 1000),
        startInput: "",
        endInput: "",
        elapsedMs: 0,
        startedAt: null,
        isRunning: false,
        color: "green",
      },
    ],
  }),
  computed: {
    selectedDateLabel() {
      return new Date(`${this.selectedDate}T00:00:00`).toLocaleDateString("ru-RU");
    },
    calendarEvents() {
      return this.tasks.map((task) => ({
        id: task.id,
        name: task.title,
        start: task.start,
        end: task.end,
        color: task.color,
        timed: true,
      }));
    },
    dayTasks() {
      return this.tasks.filter((task) => this.isTaskOnSelectedDate(task));
    },
  },
  mounted() {
    this.tasks.forEach((task) => {
      task.startInput = this.toDateTimeLocal(task.start);
      task.endInput = this.toDateTimeLocal(task.end);
    });

    this.timerInterval = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
  },
  methods: {
    isTaskOnSelectedDate(task) {
      const selected = new Date(`${this.selectedDate}T00:00:00`);
      const start = new Date(task.start);
      return (
        start.getFullYear() === selected.getFullYear() &&
        start.getMonth() === selected.getMonth() &&
        start.getDate() === selected.getDate()
      );
    },
    addTask() {
      const start = new Date(`${this.selectedDate}T09:00:00`);
      const end = new Date(`${this.selectedDate}T10:00:00`);

      this.tasks.push({
        id: this.taskSeed,
        title: `Новая задача #${this.taskSeed}`,
        description: "",
        start,
        end,
        startInput: this.toDateTimeLocal(start),
        endInput: this.toDateTimeLocal(end),
        elapsedMs: 0,
        startedAt: null,
        isRunning: false,
        color: "orange",
      });
      this.taskSeed += 1;
    },
    removeTask(id) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
    },
    updateTaskTime(task, field, value) {
      const date = value ? new Date(value) : null;
      if (!date || Number.isNaN(date.getTime())) {
        return;
      }

      if (field === "start") {
        task.start = date;
        if (task.end < task.start) {
          task.end = new Date(task.start.getTime() + 30 * 60 * 1000);
          task.endInput = this.toDateTimeLocal(task.end);
        }
      } else {
        task.end = date;
        if (task.end < task.start) {
          task.start = new Date(task.end.getTime() - 30 * 60 * 1000);
          task.startInput = this.toDateTimeLocal(task.start);
        }
      }
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
    toDateTimeLocal(value) {
      const date = value instanceof Date ? value : new Date(value);
      const pad = (num) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
        date.getHours(),
      )}:${pad(date.getMinutes())}`;
    },
  },
};
</script>

<style scoped>
.timer-box {
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 16px;
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
}
</style>
