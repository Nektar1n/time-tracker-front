import { ref, watch } from 'vue'
import { ErrorMessages } from './validationRules.js'

export function useField(field) {
  const valid = ref(true)
  const value = ref(field.value)
  const error = ref([])

  const revalidate = (value, touch = false) => {
    valid.value = true
    error.value = []
    Object.keys(field.validators ?? {}).map(async name => {
      const isValid = await field.validators[name](value)

      if (!isValid) {
        valid.value = false
        if (touch)
          error.value.push(ErrorMessages[name] ?? 'неопределенная ошибка')
      }
    })
  }

  watch(
    () => value.value,
    f => revalidate(f, true)
  )

  revalidate(value.value)

  return {
    value,
    valid,
    error,
  }
}
