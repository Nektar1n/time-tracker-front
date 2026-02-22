import { ref } from 'vue'
import Api from '@/libs/apiCall.js'

export const required = v => {
  if (Array.isArray(v)) {
    return v.length !== 0
  }
  return !!v || v === 0
}

export const isNumber = v => /(^[0-9]*$)/gi.test(v)

export const crID = v => /^([A-Z])-(\d{1,5})$/.test(v)

const emailRegex =
  // eslint-disable-next-line no-control-regex
  /^(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i
export const isEmail = v => emailRegex.test(v)

export const isEqual = (val, v) => {
  console.log(val, v, val === v)
  return val === v
}

export const minLength = num => val => {
  ErrorMessages['minLength'] = ErrorMessages['minLength'].replace(
    /\s[0-9]+\s/gi,
    ` ${num} `
  )
  return val?.length >= num
}

export const maxLength = num => val => {
  ErrorMessages['maxLength'] = ErrorMessages['maxLength'].replace(
    /\s[0-9]+\s/gi,
    ` ${num} `
  )
  return val.length <= num
}

const timer = ref(null)
export const asyncProcess = ref(false)
export const asyncCheck = async (v, delay = 1500, errorText = null) => {
  if (!v) return true
  return new Promise(resolve => {
    clearTimeout(timer.value)
    timer.value = setTimeout(async () => {
      asyncProcess.value = true
      //TODO вынести строку ниже во вне
      const data = await Api.post('/cr-main/check-code-id', v)
      clearTimeout(timer.value)
      asyncProcess.value = false
      if (errorText) ErrorMessages['asyncCheck'] = errorText

      return resolve(!data)
    }, delay)
  })
}

export const ErrorMessages = {
  required: 'Не оставляйте поле пустым',
  isNumber: 'Только цифры',
  isEmail: 'Введите правильный e-mail',
  minLength: `Не менее 0 символов`,
  maxLength: `Не более 0 символов`,
  asyncCheck: 'Проверка на сервере не пройдена',
  isEqual: 'Значения не совпадают',
  crID: 'пример: A-1xxxx',
}
