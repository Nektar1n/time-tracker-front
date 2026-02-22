<template>
  <v-form :key="renderKey" autocomplete="off">
    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.name.value"
          :error-messages="form.name.error"
          label="Имя пользователя"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.email.value"
          :error-messages="form.email.error"
          label="Почта"
          readonly
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.phone.value"
          v-mask="'+# (###) ###-##-##'"
          :error-messages="form.phone.error"
          label="Телефон"
          placeholder="+7 (012) 345-67-89"
          @keyup.ctrl.enter="_asd"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-checkbox-btn v-model="form.banned.value" label="Блокировка" />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="form.banReason.value"
          :disabled="!form.banned.value"
          hide-details
          label="Причина блокировки"
          no-resize
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-btn
          color="warning"
          @click="modal.open('resetPassword')"
        >Сброс пароля</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
  import { inject, onUnmounted, ref, watch } from 'vue'
  import Api from '@/libs/apiCall.js'
  import { useFormDrawer } from '@/modules/forms/useFormDrawer.js'
  import { isEmail, required } from '@/modules/forms/validationRules.js'
  import { useUserDrawer } from '@/modules/setup/setup-users/hook/useUserDrawer.js'

  const { renderKey } = useUserDrawer()
  const emit = defineEmits(['change'])
  const timer = ref(null)

  const props = defineProps({
    data: { type: Object },
  })

  const modal = inject('modal')

  async function _asd () {
    const data = await Api.post('/references/mkb10/nsi/import')
    console.log(data)
  }

  const { form, formData, formValid } = useFormDrawer({
    name: {
      value: props.data.name,
      validators: { required },
    },
    email: {
      value: props.data.email,
      validators: { required, isEmail },
    },
    phone: {
      value: props.data.phone || '+7',
    },
    banned: {
      value: props.data.banned,
    },
    banReason: {
      value: props.data.banReason,
    },
  })

  function _update () {
    clearTimeout(timer.value)
    timer.value = setTimeout(async () => {
      const valid = await formValid()
      if (valid) {
        const data = { ...formData() }
        data.phone = Number(data.phone?.replace(/\D/g, ''))
        emit('change', data)
      }
    }, 250)
  }

  watch(
    () => form,
    () => _update(),
    { deep: true },
  )

  // Следим за пропсом "data" для синхронизации с моделью
  watch(
    () => props.data,
    () => (renderKey.value += 1),
  )

  onUnmounted(() => clearTimeout(timer.value))
</script>

<style scoped></style>
