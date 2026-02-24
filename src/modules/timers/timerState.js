import { reactive } from 'vue'

const state = reactive({
  events: [],
  selectedDate: new Date(),
  scrollSync: null,
  actionLogs: [],
})

function addActionLog ({ eventId, eventName, action, at = Date.now() }) {
  state.actionLogs.unshift({
    id: crypto.randomUUID(),
    eventId,
    eventName,
    action,
    at,
  })
}

function pauseEvent (event) {
  if (!event?.isRunning) {
    return event
  }

  return {
    ...event,
    elapsedMs: (event.elapsedMs || 0) + (Date.now() - event.timerStartedAt),
    timerStartedAt: null,
    isRunning: false,
    wasPaused: true,
  }
}

function toggleTimerById (eventId) {
  const idx = state.events.findIndex(item => item.id === eventId)
  if (idx === -1) {
    return
  }

  const current = { ...state.events[idx] }
  if (current.isCompleted) {
    return
  }

  const updated = current.isRunning
    ? pauseEvent(current)
    : { ...current, timerStartedAt: Date.now(), isRunning: true, wasPaused: false }

  state.events.splice(idx, 1, updated)

  addActionLog({
    eventId: updated.id,
    eventName: updated.name,
    action: current.isRunning ? 'pause' : 'start',
  })
}

function completeEventById (eventId) {
  const idx = state.events.findIndex(item => item.id === eventId)
  if (idx === -1) {
    return
  }

  const current = { ...state.events[idx] }
  const paused = pauseEvent(current)

  state.events.splice(idx, 1, {
    ...paused,
    isCompleted: true,
  })

  addActionLog({
    eventId: current.id,
    eventName: current.name,
    action: 'complete',
  })
}

function updateEventById (eventId, patch) {
  const idx = state.events.findIndex(item => item.id === eventId)
  if (idx === -1) {
    return
  }

  const current = state.events[idx]
  state.events.splice(idx, 1, {
    ...current,
    ...patch,
  })
}

function setAllEvents (events) {
  state.events = [...events]
}

function setSelectedDate (date) {
  state.selectedDate = new Date(date)
}

function syncScroll (payload) {
  state.scrollSync = {
    ...payload,
    stamp: Date.now(),
  }
}

export {
  addActionLog,
  completeEventById,
  setAllEvents,
  setSelectedDate,
  state,
  syncScroll,
  toggleTimerById,
  updateEventById,
}
