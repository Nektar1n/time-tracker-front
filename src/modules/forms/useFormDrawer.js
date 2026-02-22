import { reactive } from 'vue'
import { useField } from '@/modules/forms/useField.js'

export function useFormDrawer (init = {}) {
  let form = reactive({ ...init })

  for (const [key, field] of Object.entries(init)) {
    form[key] = useField(field)
  }

  const initForm = (init = {}) => (form = reactive(init))

  const formValid = async () =>
    await new Promise(resolve => {
      const x
        = Object.values(form)
          .map(({ error }) => error)
          .filter(f => f.length > 0)
          .length === 0
      resolve(x)
    })

  const _formValid = () =>
    Object.keys(form).reduce((acc, item) => {
      if (!form[item].valid) {
        acc = form[item].valid
      }
      return acc
    }, true)

  const formData = () =>
    Object.keys(form).reduce((acc, item) => {
      acc[item] = form[item].value
      return acc
    }, {})

  return { form, formValid, formData, _formValid, initForm }
}
