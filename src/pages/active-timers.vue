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
            <div v-if="hasChecklist(event)" class="text-caption mb-2">
              <div v-for="item in event.checklist" :key="item.id">
                <v-icon :icon="item.done ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'" size="14" />
                <span :class="{ 'text-decoration-line-through': item.done }">{{ item.text }}</span>
              </div>
            </div>
            <div v-if="categoryLabel(event)" class="text-caption mb-2">{{ categoryLabel(event) }}</div>
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
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-2">Чеклист</div>
            <v-btn prepend-icon="mdi-plus" size="x-small" variant="text" @click="addDraftChecklistItem">Добавить пункт</v-btn>
          </div>
          <div v-if="(draftEvent.checklist || []).length > 0" class="d-flex flex-column ga-2">
            <div v-for="item in draftEvent.checklist" :key="item.id" class="d-flex align-center ga-2">
              <v-checkbox-btn v-model="item.done" hide-details />
              <v-text-field v-model="item.text" density="compact" hide-details placeholder="Текст пункта" />
              <v-btn icon="mdi-delete" size="x-small" variant="text" @click="removeDraftChecklistItem(item.id)" />
            </div>
          </div>
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
  import { categoryOptions, getCategoryById } from '@/modules/categories/categoryState'
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
      colorOptions: [
        { title: 'Синий', value: '#2196F3' },
        { title: 'Индиго', value: '#3F51B5' },
        { title: 'Фиолетовый', value: '#673AB7' },
        { title: 'Бирюзовый', value: '#00BCD4' },
        { title: 'Зелёный', value: '#4CAF50' },
        { title: 'Оранжевый', value: '#FF9800' },
        { title: 'Серый', value: '#757575' },
      ],
    }),
    computed: {
      categoryOptions () {
        return categoryOptions.value
      },
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
          start: event.start,
          end: event.end,
          categoryId: event.categoryId || null,
          checklist: this.normalizeChecklist(event.checklist),
          startInput: this.toDateTimeInput(event.start),
          endInput: this.toDateTimeInput(event.end),
        }
        this.isEditOpen = true
      },
      saveEvent () {
        const startValue = this.parseDateTimeInput(this.draftEvent.startInput)
        const endValue = this.parseDateTimeInput(this.draftEvent.endInput)
        const validStart = startValue || new Date(this.draftEvent.start)
        const validEnd = endValue || new Date(this.draftEvent.end)

        updateEventById(this.draftEvent.id, {
          name: this.draftEvent.name,
          details: this.draftEvent.details,
          color: this.draftEvent.color,
          start: validStart,
          end: Math.max(validEnd, validStart),
          categoryId: this.draftEvent.categoryId || null,
          checklist: this.normalizeChecklist(this.draftEvent.checklist),
        })
        this.isEditOpen = false
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
      hasChecklist (event) {
        return Array.isArray(event?.checklist) && event.checklist.length > 0
      },
      normalizeChecklist (checklist) {
        if (!Array.isArray(checklist)) return []
        return checklist
          .map(item => ({
            id: item?.id || crypto.randomUUID(),
            text: String(item?.text || '').trim(),
            done: Boolean(item?.done),
          }))
          .filter(item => item.text)
      },
      addDraftChecklistItem () {
        if (!Array.isArray(this.draftEvent.checklist)) this.draftEvent.checklist = []
        this.draftEvent.checklist.push({ id: crypto.randomUUID(), text: '', done: false })
      },
      removeDraftChecklistItem (itemId) {
        this.draftEvent.checklist = (this.draftEvent.checklist || []).filter(item => item.id !== itemId)
      },
      categoryLabel (event) {
        const category = getCategoryById(event?.categoryId)
        return category ? `${category.emoji} ${category.name}` : ''
      },
      formatDateTime (value) {
        const date = new Date(value)
        return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { hour12: false })}`
      },
    },
  }
</script>
