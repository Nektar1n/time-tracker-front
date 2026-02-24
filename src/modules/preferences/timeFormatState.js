import { computed, ref } from 'vue'

const STORAGE_KEY = 'timeFormatMode'
const DEFAULT_MODE = '12h'

const allowedModes = new Set(['12h', '24h'])

function resolveInitialMode () {
  const savedMode = localStorage.getItem(STORAGE_KEY)
  if (allowedModes.has(savedMode)) {
    return savedMode
  }
  return DEFAULT_MODE
}

const mode = ref(resolveInitialMode())

function setTimeFormatMode (nextMode) {
  if (!allowedModes.has(nextMode)) {
    return
  }

  mode.value = nextMode
  localStorage.setItem(STORAGE_KEY, nextMode)
}

function toggleTimeFormatMode () {
  setTimeFormatMode(mode.value === '24h' ? '12h' : '24h')
}

function formatDateTimeValue (value, forcedMode = mode.value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const locale = navigator.language || 'ru-RU'
  const datePart = date.toLocaleDateString(locale)
  const timePart = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: forcedMode === '12h',
  })

  return `${datePart} ${timePart}`
}

const is24Hour = computed(() => mode.value === '24h')

export {
  formatDateTimeValue,
  is24Hour,
  setTimeFormatMode,
  mode as timeFormatMode,
  toggleTimeFormatMode,
}
