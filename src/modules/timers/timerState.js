import { reactive } from 'vue'

const state = reactive({
  events: [],
  selectedDate: new Date(),
  scrollSync: null,
})

const pauseEvent = (event) => {
  if (!event?.isRunning) return event

  return {
    ...event,
    elapsedMs: (event.elapsedMs || 0) + (Date.now() - event.timerStartedAt),
    timerStartedAt: null,
    isRunning: false,
  }
}

const toggleTimerById = (eventId) => {
  const idx = state.events.findIndex(item => item.id === eventId)
  if (idx === -1) return

  const current = { ...state.events[idx] }
  if (current.isCompleted) return

  const updated = current.isRunning
    ? pauseEvent(current)
    : { ...current, timerStartedAt: Date.now(), isRunning: true }

  state.events.splice(idx, 1, updated)
}

const completeEventById = (eventId) => {
  const idx = state.events.findIndex(item => item.id === eventId)
  if (idx === -1) return

  const current = { ...state.events[idx] }
  const paused = pauseEvent(current)

  state.events.splice(idx, 1, {
    ...paused,
    isCompleted: true,
  })
}

const updateEventById = (eventId, patch) => {
  const idx = state.events.findIndex(item => item.id === eventId)
  if (idx === -1) return

  const current = state.events[idx]
  state.events.splice(idx, 1, {
    ...current,
    ...patch,
  })
}

const setAllEvents = (events) => {
  state.events = [...events]
}

const setSelectedDate = (date) => {
  state.selectedDate = new Date(date)
}

const syncScroll = (payload) => {
  state.scrollSync = {
    ...payload,
    stamp: Date.now(),
  }
}

export {
  state,
  setAllEvents,
  setSelectedDate,
  syncScroll,
  toggleTimerById,
  completeEventById,
  updateEventById,
}
