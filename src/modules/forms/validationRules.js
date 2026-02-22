import { ref } from 'vue'
import Api from '@/libs/apiCall.js'

export function required (v) {
  if (Array.isArray(v)) {
    return v.length > 0
  }
  return !!v || v === 0
}

export const isNumber = v => /(^[0-9]*$)/gi.test(v)

export const crID = v => /^([A-Z])-(\d{1,5})$/.test(v)

const emailRegex
  // eslint-disable-next-line no-control-regex
  = /^(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\u0001-\u0008\u000B\u000C\u000E-\u001F\u0021\u0023-\u005B\u005D-\u007F]|[\u0001-\u0009\u000B\u000C\u000E-\u007F])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\u0001-\u0008\u000B\u000C\u000E-\u001F\u0021-\u005A\u0053-\u007F]|\\[\u0001-\u0009\u000B\u000C\u000E-\u007F])+)\])$/i
export const isEmail = v => emailRegex.test(v)

export function isEqual (val, v) {
  console.log(val, v, val === v)
  return val === v
}

export function minLength (num) {
  return val => {
    ErrorMessages['minLength'] = ErrorMessages['minLength'].replace(
      /\s[0-9]+\s/gi,
      ` ${num} `,
    )
    return val?.length >= num
  }
}

export function maxLength (num) {
  return val => {
    ErrorMessages['maxLength'] = ErrorMessages['maxLength'].replace(
      /\s[0-9]+\s/gi,
      ` ${num} `,
    )
    return val.length <= num
  }
}

const timer = ref(null)
export const asyncProcess = ref(false)
export async function asyncCheck (v, delay = 1500, errorText = null) {
  if (!v) {
    return true
  }
  return new Promise(resolve => {
    clearTimeout(timer.value)
    timer.value = setTimeout(async () => {
      asyncProcess.value = true
      // TODO вынести строку ниже во вне
      const data = await Api.post('/cr-main/check-code-id', v)
      clearTimeout(timer.value)
      asyncProcess.value = false
      if (errorText) {
        ErrorMessages['asyncCheck'] = errorText
      }

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
