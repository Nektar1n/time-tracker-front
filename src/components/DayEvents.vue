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
        @mousedown:event="startDrag"
        @mousedown:time="startTime"
        @mouseleave="cancelDrag"
        @mousemove:time="mouseMove"
        @mouseup:time="endDrag"
      >
        <template #event="{ event, timed, eventSummary }">
          <div class="v-event-draggable d-flex align-center ga-1">
            <span v-if="categoryLabel(event)" class="event-category">{{ categoryLabel(event) }}</span>
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
              <v-icon
                :color="event.isCompleted ? 'success' : undefined"
                size="14"
              >
                {{ event.isCompleted ? "mdi-check-circle" : "mdi-check" }}
              </v-icon>
            </v-btn>
            <v-btn
              draggable="true"
              icon
              size="x-small"
              title="Перенести в левый календарь"
              variant="text"
              @click="openEditEventById(event.id)"
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
          <v-text-field
            v-model="draftEvent.startInput"
            label="Начало"
            type="datetime-local"
          />
          <v-text-field
            v-model="draftEvent.endInput"
            label="Окончание"
            type="datetime-local"
          />
          <v-select
            v-model="draftEvent.color"
            item-title="title"
            item-value="value"
            :items="colorOptions"
            label="Цвет"
          />
          <v-select
            v-model="draftEvent.categoryId"
            item-title="title"
            item-value="value"
            :items="categoryOptions"
            label="Категория"
          />
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
  import { categoryOptions, state as categoryState, getCategoryById } from '@/modules/categories/categoryState'
  import { addActionLog } from '@/modules/timers/timerState'

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
      scrollSync: {
        type: Object,
        default: null,
      },
    },
    emits: ['update:events', 'sync-scroll'],
    data: () => ({
      focus: null,
      localEvents: [],
      colorOptions: [
        { title: 'Синий', value: '#2196F3' },
        { title: 'Индиго', value: '#3F51B5' },
        { title: 'Фиолетовый', value: '#673AB7' },
        { title: 'Бирюзовый', value: '#00BCD4' },
        { title: 'Зелёный', value: '#4CAF50' },
        { title: 'Оранжевый', value: '#FF9800' },
        { title: 'Серый', value: '#757575' },
      ],
      dragEvent: null,
      dragTime: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null,
      timerTick: 0,
      ticker: null,
      isEditOpen: false,
      draftEvent: {},
      suppressScrollEmit: false,
      scrollElement: null,
    }),
    computed: {
      categoryOptions () {
        return categoryOptions.value
      },
      categories () {
        return categoryState.categories
      },
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
          if (this.dragEvent || this.createEvent) {
            return
          }

          this.localEvents = value.map(item => ({
            ...item,
            isCompleted: Boolean(item.isCompleted),
          }))
        },
      },
      scrollSync: {
        deep: true,
        handler (value) {
          if (!value || value.source === 'day-events') return
          this.applySyncedScroll(value.top)
        },
      },
    },
    mounted () {
      this.ticker = setInterval(() => {
        this.timerTick = Date.now()
      }, 1000)

      this.$nextTick(() => {
        this.bindScrollSync()
      })
    },
    beforeUnmount () {
      clearInterval(this.ticker)
      this.unbindScrollSync()
    },
    methods: {
      bindScrollSync () {
        this.unbindScrollSync()

        const el = this.getScrollElement()
        if (!el) return

        this.scrollElement = el
        this.scrollElement.addEventListener('scroll', this.onInternalScroll, {
          passive: true,
        })
      },
      unbindScrollSync () {
        if (!this.scrollElement) return

        this.scrollElement.removeEventListener('scroll', this.onInternalScroll)
        this.scrollElement = null
      },
      getScrollElement () {
        const root = this.$refs.calendar?.$el
        if (!root) return null

        const selectors = [
          '.v-calendar-daily__scroll-area',
          '.v-calendar-daily__body',
          '.v-calendar-weekly__scroll-area',
          '.v-calendar-weekly__scroll-container',
        ]

        for (const selector of selectors) {
          const node = root.querySelector(selector)
          if (node && node.scrollHeight > node.clientHeight) return node
        }

        return (
          Array.from(root.querySelectorAll('div')).find(
            node => node.scrollHeight > node.clientHeight + 5,
          ) || null
        )
      },
      onInternalScroll (event) {
        if (this.suppressScrollEmit) return
        this.$emit('sync-scroll', {
          source: 'day-events',
          top: event.target.scrollTop,
        })
      },
      applySyncedScroll (top) {
        const el = this.getScrollElement()
        if (!el) return

        this.suppressScrollEmit = true
        el.scrollTop = top
        requestAnimationFrame(() => {
          this.suppressScrollEmit = false
        })
      },
      openEditEventById (eventId) {
        const event = this.localEvents.find(item => item.id === eventId)
        if (!event) return

        this.draftEvent = {
          ...event,
          isCompleted: Boolean(event.isCompleted),
          startInput: this.toDateTimeInput(event.start),
          endInput: this.toDateTimeInput(event.end),
        }
        this.isEditOpen = true
      },
      emitEvents () {
        this.$emit(
          'update:events',
          this.localEvents.map(item => ({ ...item })),
        )
      },
      openEditEvent (nativeEvent, payload) {
        const event = payload?.event
        if (!event) return
        this.draftEvent = {
          ...event,
          isCompleted: Boolean(event.isCompleted),
          startInput: this.toDateTimeInput(event.start),
          endInput: this.toDateTimeInput(event.end),
        }
        this.isEditOpen = true
        nativeEvent.stopPropagation()
      },
      saveEvent () {
        const idx = this.localEvents.findIndex(
          item => item.id === this.draftEvent.id,
        )
        if (idx !== -1) {
          const startValue = this.parseDateTimeInput(this.draftEvent.startInput)
          const endValue = this.parseDateTimeInput(this.draftEvent.endInput)
          const validStart = startValue || new Date(this.draftEvent.start)
          const validEnd = endValue || new Date(this.draftEvent.end)

          const {
            startInput: _startInput,
            endInput: _endInput,
            ...restDraft
          } = this.draftEvent
          const updatedEvent = {
            ...restDraft,
            start: validStart,
            end: Math.max(validEnd, validStart),
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
        event.elapsedMs
          = (event.elapsedMs || 0) + (Date.now() - event.timerStartedAt)
        event.timerStartedAt = null
        event.isRunning = false
        event.wasPaused = true
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
          current.wasPaused = false
        }

        this.localEvents.splice(idx, 1, current)
        this.emitEvents()

        addActionLog({
          eventId: current.id,
          eventName: current.name,
          action: current.isRunning ? 'start' : 'pause',
        })
      },
      completeTask (event) {
        const idx = this.localEvents.findIndex(item => item.id === event.id)
        if (idx === -1) return

        const current = { ...this.localEvents[idx] }
        current.isCompleted = !current.isCompleted
        if (current.isCompleted) {
          this.pauseEvent(current)
          addActionLog({
            eventId: current.id,
            eventName: current.name,
            action: 'complete',
          })
        }

        this.localEvents.splice(idx, 1, current)
        this.emitEvents()

        addActionLog({
          eventId: current.id,
          eventName: current.name,
          action: current.isRunning ? 'start' : 'pause',
        })
      },
      onDraftCompletionChange (value) {
        if (!value) return
        this.pauseEvent(this.draftEvent)
      },
      categoryLabel (event) {
        const category = getCategoryById(event?.categoryId)
        return category ? `${category.emoji} ${category.name}` : ''
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
        const minimumDuration = 30 * 60 * 1000

        if (this.dragEvent && this.dragTime === null) {
          const start = this.toTimestamp(this.dragEvent.start)

          this.dragTime = mouse - start
        } else {
          this.createStart = this.roundTime(mouse)
          this.createEvent = {
            id: crypto.randomUUID(),
            name: `Event #${this.events.length}`,
            color: this.rndElement(this.colorOptions).value,
            start: this.createStart,
            end: this.createStart + minimumDuration,
            timed: true,
            elapsedMs: 0,
            isRunning: false,
            isCompleted: false,
            categoryId: this.rndElement(this.categories)?.id || null,
            wasPaused: false,
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

        if (this.dragEvent && this.dragTime === null) {
          this.dragTime = mouse - this.toTimestamp(this.dragEvent.start)
          return
        }

        if (this.dragEvent && this.dragTime !== null) {
          const start = this.toTimestamp(this.dragEvent.start)
          const end = this.toTimestamp(this.dragEvent.end)
          const duration = end - start
          const newStartTime = mouse - this.dragTime
          const newStart = this.roundTime(newStartTime)
          const newEnd = newStart + duration

          this.dragEvent.start = newStart
          this.dragEvent.end = newEnd
          this.emitEvents()
        } else if (this.createEvent && this.createStart !== null) {
          const mouseRounded = this.roundTime(mouse, false)
          const min = Math.min(mouseRounded, this.createStart)
          const max = Math.max(mouseRounded, this.createStart)

          this.createEvent.start = min
          this.createEvent.end = max
          this.emitEvents()
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
        return down
          ? time - (time % roundDownTime)
          : time + (roundDownTime - (time % roundDownTime))
      },
      toTime (tms) {
        return new Date(
          tms.year,
          tms.month - 1,
          tms.day,
          tms.hour,
          tms.minute,
        ).getTime()
      },
      toTimestamp (value) {
        if (typeof value === 'number') return value
        return new Date(value).getTime()
      },
      getEventColor (event) {
        return event.color
      },
      toDateTimeInput (value) {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ''
        const offset = date.getTimezoneOffset() * 60_000
        return new Date(date.getTime() - offset).toISOString().slice(0, 16)
      },
      parseDateTimeInput (value) {
        if (!value) return null
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
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

.event-category {
  font-size: 11px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgb(var(--v-theme-surface-variant));
  border-radius: 10px;
  padding: 1px 6px;
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
