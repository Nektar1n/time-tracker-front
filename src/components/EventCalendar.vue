<template>
  <div>
    <v-sheet class="d-flex" tile>
      <v-btn class="ma-2" icon variant="text" @click="next()">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <p>
        {{ calendarTitle }}
      </p>
      <v-select
        v-model="type"
        class="ma-2"
        density="comfortable"
        hide-details
        :items="types"
        label="type"
        variant="outlined"
      />
      <v-spacer />
      <v-btn class="ma-2" icon variant="text" @click="prev()">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-sheet>
    <v-sheet height="600">
      <v-calendar
        ref="calendar"
        v-model="focus"
        :event-color="getEventColor"
        :event-overlap-mode="mode"
        :event-overlap-threshold="30"
        :events="localEvents"
        :type="type"
        :weekdays="weekday"
        @change="getEvents"
        @click:date="viewDay"
        @click:event="openEditEvent"
        @mousedown:event="startDrag"
        @mousedown:time="startTime"
        @mouseleave="cancelDrag"
        @mousemove:time="mouseMove"
        @mouseup:time="endDrag"
      >
        <template #day-label="{ day, date }">
          <div class="pa-1">
            <v-btn
              class="calendar-day-btn"
              :class="{ 'calendar-day-btn--active': isActiveDate(date) }"
              :color="isActiveDate(date) ? 'primary' : undefined"
              rounded="xl"
              size="small"
              :variant="isActiveDate(date) ? 'flat' : 'text'"
              @click="viewDay(date)"
              @dragover.prevent
              @drop.prevent="onDropToDate(date, $event)"
            >
              <p>{{ day }}</p>
            </v-btn>
          </div>
        </template>
        <template #day-label-header="{ day, date }">
          <v-btn
            class="calendar-day-btn"
            :class="{ 'calendar-day-btn--active': isActiveDate(date) }"
            :color="isActiveDate(date) ? 'primary' : undefined"
            rounded="xl"
            size="small"
            :variant="isActiveDate(date) ? 'flat' : 'text'"
            @click="viewDay(date)"
            @dragover.prevent
            @drop.prevent="onDropToDate(date, $event)"
          >
            <p>{{ day }}</p>
          </v-btn>
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
    name: 'EventCalendar',
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
    emits: ['update:events', 'update:selected-date', 'sync-scroll'],
    data: () => ({
      calendarTitle: '',
      focus: '',
      type: 'month',
      types: ['month', 'week'],
      mode: 'stack',
      weekday: [0, 1, 2, 3, 4, 5, 6],
      localEvents: [],
      colors: ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4', '#4CAF50', '#FF9800', '#757575'],
      names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
      dragEvent: null,
      dragTime: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null,
      suppressScrollEmit: false,
      scrollElement: null,
      isEditOpen: false,
      draftEvent: {},
    }),
    watch: {
      events: {
        immediate: true,
        deep: true,
        handler (value) {
          this.localEvents = value.map(item => ({ ...item }))
        },
      },
      selectedDate: {
        immediate: true,
        handler (value) {
          this.focus = value
        },
      },
      type () {
        this.$nextTick(() => {
          this.bindScrollSync()
        })
      },
      scrollSync: {
        deep: true,
        handler (value) {
          if (!value || value.source === 'week-calendar') return
          if (this.type !== 'week') return

          this.applySyncedScroll(value.top)
        },
      },
    },
    mounted () {
      this.$refs.calendar.checkChange()
      this.calendarTitle = this.$refs.calendar.title || ''

      this.$nextTick(() => {
        this.bindScrollSync()
      })
    },
    beforeUnmount () {
      this.unbindScrollSync()
    },
    methods: {
      bindScrollSync () {
        this.unbindScrollSync()

        if (this.type !== 'week') return

        const el = this.getScrollElement()
        if (!el) return

        this.scrollElement = el
        this.scrollElement.addEventListener('scroll', this.onInternalScroll, { passive: true })
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
          '.v-calendar-weekly__week',
        ]

        for (const selector of selectors) {
          const node = root.querySelector(selector)
          if (node && node.scrollHeight > node.clientHeight) return node
        }

        return Array.from(root.querySelectorAll('div')).find(
          node => node.scrollHeight > node.clientHeight + 5,
        ) || null
      },
      onInternalScroll (event) {
        if (this.suppressScrollEmit) return
        this.$emit('sync-scroll', {
          source: 'week-calendar',
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
      isActiveDate (date) {
        return this.normalizeDate(date) === this.normalizeDate(this.focus)
      },
      normalizeDate (value) {
        if (!value) return ''
        if (value instanceof Date) return value.toISOString().slice(0, 10)

        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)

        return String(value).slice(0, 10)
      },
      openEditEvent (nativeEvent, payload) {
        const event = payload?.event
        if (!event) return

        this.draftEvent = { ...event }
        this.isEditOpen = true
        nativeEvent.stopPropagation()
      },
      saveEvent () {
        const idx = this.localEvents.findIndex(item => item.id === this.draftEvent.id)
        if (idx !== -1) {
          this.localEvents.splice(idx, 1, { ...this.draftEvent })
          this.emitEvents()
        }
        this.isEditOpen = false
      },
      emitEvents () {
        this.$emit('update:events', this.localEvents.map(item => ({ ...item })))
      },
      viewDay (date) {
        this.focus = date
        this.$emit('update:selected-date', new Date(date))
      },
      getEvents ({ start, end }) {
        if (this.localEvents.length > 0) {
          this.calendarTitle = this.$refs.calendar.title || ''
          return
        }

        const events = []
        const min = new Date(`${start.date}T00:00:00`)
        const max = new Date(`${end.date}T23:59:59`)
        const days = (max.getTime() - min.getTime()) / 86_400_000
        const eventCount = this.rnd(days, days + 20)

        for (let i = 0; i < eventCount; i++) {
          const allDay = this.rnd(0, 3) === 0
          const firstTimestamp = this.rnd(min.getTime(), max.getTime())
          const first = new Date(firstTimestamp - (firstTimestamp % 900_000))
          const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900_000
          const second = new Date(first.getTime() + secondTimestamp)

          events.push({
            id: crypto.randomUUID(),
            name: this.names[this.rnd(0, this.names.length - 1)],
            details: '',
            start: first,
            end: second,
            color: this.colors[this.rnd(0, this.colors.length - 1)],
            timed: !allDay,
            elapsedMs: 0,
            isRunning: false,
            isCompleted: false,
          })
        }

        this.localEvents = events
        this.emitEvents()
        this.calendarTitle = this.$refs.calendar.title || ''
      },
      getEventColor (event) {
        return event.color
      },
      prev () {
        this.$refs.calendar.prev()
        this.calendarTitle = this.$refs.calendar.title || ''
      },
      next () {
        this.$refs.calendar.next()
        this.calendarTitle = this.$refs.calendar.title || ''
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
          this.dragTime = mouse - new Date(this.dragEvent.start).getTime()
        } else {
          this.createStart = this.roundTime(mouse)
          this.createEvent = {
            id: crypto.randomUUID(),
            name: `Event #${this.localEvents.length}`,
            details: '',
            color: this.rndElement(this.colors),
            start: new Date(this.createStart),
            end: new Date(this.createStart),
            timed: true,
            elapsedMs: 0,
            isRunning: false,
            isCompleted: false,
          }

          this.localEvents.push(this.createEvent)
          this.emitEvents()
        }
      },
      mouseMove (nativeEvent, tms) {
        const mouse = this.toTime(tms)

        if (this.dragEvent && this.dragTime !== null) {
          const start = new Date(this.dragEvent.start).getTime()
          const end = new Date(this.dragEvent.end).getTime()
          const duration = end - start
          const newStart = this.roundTime(mouse - this.dragTime)

          this.dragEvent.start = new Date(newStart)
          this.dragEvent.end = new Date(newStart + duration)
          this.emitEvents()
        } else if (this.createEvent && this.createStart !== null) {
          const mouseRounded = this.roundTime(mouse, false)
          const min = Math.min(mouseRounded, this.createStart)
          const max = Math.max(mouseRounded, this.createStart)

          this.createEvent.start = new Date(min)
          this.createEvent.end = new Date(max)
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
          const i = this.localEvents.indexOf(this.createEvent)
          if (i !== -1 && this.createEvent.start?.getTime() === this.createEvent.end?.getTime()) {
            this.localEvents.splice(i, 1)
            this.emitEvents()
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
      rndElement (arr) {
        return arr[this.rnd(0, arr.length - 1)]
      },
      rnd (a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a
      },
      onDropToDate (date, dragEvent) {
        const eventId = dragEvent.dataTransfer?.getData('eventId')
        if (!eventId) return

        const event = this.localEvents.find(item => item.id === eventId)
        if (!event) return

        const start = new Date(event.start)
        const end = new Date(event.end)
        const duration = end.getTime() - start.getTime()
        const target = new Date(date)

        target.setHours(start.getHours(), start.getMinutes(), 0, 0)
        event.start = new Date(target)
        event.end = new Date(target.getTime() + duration)

        this.emitEvents()
        this.viewDay(target)
      },
    },
  }
</script>

<style scoped>
  .calendar-day-btn {
    transition: all 0.2s ease;
  }

  .calendar-day-btn--active {
    box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
    font-weight: 700;
  }

  .calendar-day-btn--active :deep(*) {
    color: rgb(var(--v-theme-on-primary));
  }
</style>
