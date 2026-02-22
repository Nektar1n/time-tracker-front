<template>
  <v-form autocomplete="off">
    <v-text-field
      v-model="form.name.value"
      autofocus
      :error-messages="form.name.error"
      label="Имя пользователя"
      @update:model-value="_updateData"
    />
    <v-text-field
      v-model="form.email.value"
      :error-messages="form.email.error"
      label="Почта"
      @update:model-value="_updateData"
    />
    <v-select
      v-model="form.roles.value"
      :error-messages="form.roles.error"
      item-title="name"
      item-value="value"
      :items="rolesList"
      label="Роль в программе"
      multiple
      @update:model-value="_updateData"
    />
    <v-alert
      border="start"
      density="comfortable"
      text="Пользователю будет отправлено письмо о регистрации"
      type="info"
    />
  </v-form>
</template>

<script setup>
  import { computed, inject } from 'vue'
  import { useFormDrawer } from '@/modules/forms/useFormDrawer.js'
  import { isEmail, required } from '@/modules/forms/validationRules.js'
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

  function _updateData () {
    modal.data = JSON.stringify(formData())
  }
</script>

<style scoped></style>
