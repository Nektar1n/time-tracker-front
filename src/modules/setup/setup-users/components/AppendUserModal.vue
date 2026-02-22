<template>
  <v-form autocomplete="off">
    <v-text-field
      autofocus
      label="Имя пользователя"
      v-model="form.name.value"
      :error-messages="form.name.error"
      @update:model-value="_updateData"
    />
    <v-text-field
      label="Почта"
      v-model="form.email.value"
      :error-messages="form.email.error"
      @update:model-value="_updateData"
    />
    <v-select
      multiple
      label="Роль в программе"
      v-model="form.roles.value"
      :error-messages="form.roles.error"
      :items="rolesList"
      item-title="name"
      item-value="value"
      @update:model-value="_updateData"
    />
    <v-alert
      density="comfortable"
      type="info"
      text="Пользователю будет отправлено письмо о регистрации"
      border="start"
    ></v-alert>
  </v-form>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useFormDrawer } from '@/modules/forms/useFormDrawer.js'
import { required, isEmail } from '@/modules/forms/validationRules.js'
import { useUserDrawer } from '@/modules/setup/setup-users/hook/useUserDrawer.js'

const modal = inject('modal')
const { rolesList } = useUserDrawer()
const { form, _formValid, formData } = useFormDrawer({
  name: {
    value: null,
    validators: { required },
  },
  email: {
    value: null,
    validators: { required, isEmail },
  },
  roles: {
    value: null,
    validators: { required },
  },
})

modal.disabled = computed(() => !_formValid())

const _updateData = () => {
  modal.data = JSON.stringify(formData())
}
</script>

<style scoped></style>
