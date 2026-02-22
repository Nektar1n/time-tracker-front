<template>
  <div>
    <v-sheet height="700">
      <v-calendar
        ref="calendar"
        v-model="focus"
        :event-color="getEventColor"
        :event-ripple="false"
        :events="dayEvents"
        type="day"
        @click:event="openEditEvent"
        @mousedown:event="startDrag"
        @mousedown:time="startTime"
        @mouseleave="cancelDrag"
        @mousemove:time="mouseMove"
        @mouseup:time="endDrag"
      >
        <template #event="{ event, timed, eventSummary }">
          <div class="v-event-draggable d-flex align-center ga-1">
            <v-btn
              :disabled="event.isCompleted"
              icon
              size="x-small"
              variant="text"
              @click.stop="toggleTimer(event)"
            >
              <v-icon size="14">{{
                event.isRunning ? "mdi-pause" : "mdi-play"
              }}</v-icon>
            </v-btn>
            <v-btn
              icon
              size="x-small"
              variant="text"
              @click.stop="completeTask(event)"
            >
              <v-icon :color="event.isCompleted ? 'success' : undefined" size="14">
                {{ event.isCompleted ? "mdi-check-circle" : "mdi-check" }}
              </v-icon>
            </v-btn>
            <v-btn
              draggable="true"
              icon
              size="x-small"
              title="Перенести в левый календарь"
              variant="text"
              @dragstart.stop="startExternalDrag(event, $event)"
              @mousedown.stop
            >
              <v-icon size="14">mdi-drag</v-icon>
            </v-btn>
            <component :is="eventSummary" />
            <small class="event-timer">{{ formatElapsed(event) }}</small>
          </div>
          <div
            v-if="timed"
            class="v-event-drag-bottom"
            @mousedown.stop="extendBottom(event)"
          />
        </template>
      </v-calendar>
    </v-sheet>

    <v-dialog v-model="isEditOpen" max-width="450">
      <v-card>
        <v-card-title>Редактирование задачи</v-card-title>
        <v-card-text class="d-flex flex-column ga-3">
          <v-text-field v-model="draftEvent.name" label="Название" />
          <v-textarea v-model="draftEvent.details" label="Описание" rows="3" />
          <v-select v-model="draftEvent.color" :items="colors" label="Цвет" />
          <v-switch
            v-model="draftEvent.isCompleted"
            color="success"
            hide-details
            label="Задача завершена"
            @update:model-value="onDraftCompletionChange"
          />
          <div class="text-caption">Статус: {{ taskStatus(draftEvent) }}</div>
          <div class="text-caption">
            Таймер: {{ formatElapsed(draftEvent) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isEditOpen = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveEvent">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: 'DayEvents',
    props: {
      events: {
        type: Array,
        default: () => [],
      },
      selectedDate: {
        type: [String, Date],
        default: () => new Date(),
      },
    },
    emits: ['update:events'],
    data: () => ({
      focus: null,
      localEvents: [],
      colors: ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4', '#4CAF50', '#FF9800', '#757575'],
      dragEvent: null,
      dragTime: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null,
      timerTick: 0,
      ticker: null,
      isEditOpen: false,
      draftEvent: {},
    }),
    computed: {
      dayEvents () {
        const selected = new Date(this.focus)
        return this.localEvents.filter(item => {
          const start = new Date(item.start)
          const end = new Date(item.end)
          return (
            start.toDateString() === selected.toDateString()
            || end.toDateString() === selected.toDateString()
          )
        })
      },
    },
    watch: {
      selectedDate: {
        immediate: true,
        handler (value) {
          this.focus = new Date(value)
        },
      },
      events: {
        immediate: true,
        deep: true,
        handler (value) {
          this.localEvents = value.map(item => ({
            ...item,
            isCompleted: Boolean(item.isCompleted),
          }))
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
      emitEvents () {
        this.$emit('update:events', this.localEvents.map(item => ({ ...item })))
      },
      openEditEvent (nativeEvent, payload) {
        const event = payload?.event
        if (!event) return
        this.draftEvent = { ...event, isCompleted: Boolean(event.isCompleted) }
        this.isEditOpen = true
        nativeEvent.stopPropagation()
      },
      saveEvent () {
        const idx = this.localEvents.findIndex(item => item.id === this.draftEvent.id)
        if (idx !== -1) {
          const updatedEvent = {
            ...this.draftEvent,
            isCompleted: Boolean(this.draftEvent.isCompleted),
          }
          if (updatedEvent.isCompleted) {
            this.pauseEvent(updatedEvent)
          }
          this.localEvents.splice(idx, 1, updatedEvent)
          this.emitEvents()
        }
        this.isEditOpen = false
      },
      pauseEvent (event) {
        if (!event.isRunning) return
        event.elapsedMs = (event.elapsedMs || 0) + (Date.now() - event.timerStartedAt)
        event.timerStartedAt = null
        event.isRunning = false
      },
      toggleTimer (event) {
        const idx = this.localEvents.findIndex(item => item.id === event.id)
        if (idx === -1) return

        const current = { ...this.localEvents[idx] }
        if (current.isCompleted) return

        if (current.isRunning) {
          this.pauseEvent(current)
        } else {
          current.timerStartedAt = Date.now()
          current.isRunning = true
        }

        this.localEvents.splice(idx, 1, current)
        this.emitEvents()
      },
      completeTask (event) {
        const idx = this.localEvents.findIndex(item => item.id === event.id)
        if (idx === -1) return

        const current = { ...this.localEvents[idx] }
        current.isCompleted = !current.isCompleted
        if (current.isCompleted) {
          this.pauseEvent(current)
        }

        this.localEvents.splice(idx, 1, current)
        this.emitEvents()
      },
      onDraftCompletionChange (value) {
        if (!value) return
        this.pauseEvent(this.draftEvent)
      },
      taskStatus (event) {
        if (event?.isCompleted) return 'Завершена'
        if (event?.isRunning) return 'В работе'
        return 'На паузе'
      },
      getElapsedMs (event) {
        const elapsed = event?.elapsedMs || 0
        if (event?.isRunning && event?.timerStartedAt) {
          return elapsed + (this.timerTick - event.timerStartedAt)
        }
        return elapsed
      },
      formatElapsed (event) {
        const value = this.getElapsedMs(event)
        const totalSeconds = Math.max(0, Math.floor(value / 1000))
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
        const s = String(totalSeconds % 60).padStart(2, '0')
        return `${h}:${m}:${s}`
      },
      startExternalDrag (event, nativeEvent) {
        nativeEvent.dataTransfer.dropEffect = 'move'
        nativeEvent.dataTransfer.setData('eventId', event.id)
      },
      startDrag (nativeEvent, { event, timed }) {
        if (event && timed) {
          this.dragEvent = event
          this.dragTime = null
          this.extendOriginal = null
        }
      },
      startTime (nativeEvent, tms) {
        const mouse = this.toTime(tms)

        if (this.dragEvent && this.dragTime === null) {
          const start = this.dragEvent.start

          this.dragTime = mouse - start
        } else {
          this.createStart = this.roundTime(mouse)
          this.createEvent = {
            id: crypto.randomUUID(),
            name: `Event #${this.events.length}`,
            color: this.rndElement(this.colors),
            start: this.createStart,
            end: this.createStart,
            timed: true,
            elapsedMs: 0,
            isRunning: false,
            isCompleted: false,
          }

          this.localEvents.push(this.createEvent)
          this.emitEvents()
        }
      },
      extendBottom (event) {
        this.createEvent = event
        this.createStart = event.start
        this.extendOriginal = event.end
      },
      mouseMove (nativeEvent, tms) {
        const mouse = this.toTime(tms)

        if (this.dragEvent && this.dragTime !== null) {
          const start = this.dragEvent.start
          const end = this.dragEvent.end
          const duration = end - start
          const newStartTime = mouse - this.dragTime
          const newStart = this.roundTime(newStartTime)
          const newEnd = newStart + duration

          this.dragEvent.start = newStart
          this.dragEvent.end = newEnd
        } else if (this.createEvent && this.createStart !== null) {
          const mouseRounded = this.roundTime(mouse, false)
          const min = Math.min(mouseRounded, this.createStart)
          const max = Math.max(mouseRounded, this.createStart)

          this.createEvent.start = min
          this.createEvent.end = max
        }
      },
      endDrag () {
        this.dragTime = null
        this.dragEvent = null
        this.createEvent = null
        this.createStart = null
        this.extendOriginal = null
      },
      cancelDrag () {
        if (this.createEvent) {
          if (this.extendOriginal) {
            this.createEvent.end = this.extendOriginal
          } else {
            const i = this.localEvents.indexOf(this.createEvent)
            if (i !== -1) {
              this.localEvents.splice(i, 1)
              this.emitEvents()
            }
          }
        }

        this.createEvent = null
        this.createStart = null
        this.dragTime = null
        this.dragEvent = null
      },
      roundTime (time, down = true) {
        const roundDownTime = 15 * 60 * 1000
        return down ? time - (time % roundDownTime) : time + (roundDownTime - (time % roundDownTime))
      },
      toTime (tms) {
        return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
      },
      getEventColor (event) {
        return event.color
      },
      rndElement (arr) {
        return arr[this.rnd(0, arr.length - 1)]
      },
      rnd (a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a
      },
    },
  }
</script>

<style scoped>
.v-event-draggable {
  padding-left: 6px;
}

.v-event-timed {
  user-select: none;
  -webkit-user-select: none;
}

.event-timer {
  font-size: 12px;
  font-weight: 700;
  margin-left: auto;
}

.v-event-drag-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 4px;
  cursor: ns-resize;
}
</style>
