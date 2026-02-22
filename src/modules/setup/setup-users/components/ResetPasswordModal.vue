<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <div v-html="data.text" />
        <div v-html="data.sub" />
        <v-alert
          v-if="data.link"
          border="start"
          class="mt-2"
          color="info"
          density="compact"
          variant="tonal"
        >
          {{ data.link }}
          <template #append>
            <v-btn
              v-copy="`${data.link}`"
              icon="mdi-content-copy"
              title="Копировать"
              variant="text"
            />
          </template>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { inject, onMounted, reactive } from 'vue'
  import { useToast } from 'vue-toastification'
  import { useUserDrawer } from '@/modules/setup/setup-users/hook/useUserDrawer.js'

  const modal = inject('modal')

  const props = defineProps({ user: {} })
  const toast = useToast()

  const { newPasswordRequest, resetData } = useUserDrawer()

  const data = reactive({
    text: '',
    sub: '',
    link: '',
  })

  async function sendRequest () {
    try {
      modal.loading = true
      await newPasswordRequest(props.user.id)
      data.text = 'Письмо успешно отправлено'
      data.sub = `Если пользователю с электронной почтой: <span class="font-weight-bold">${props.user.email}</span> не пришла ссылка для установки нового пароля, можете прислать её вручную:`
      data.link = `${window.location.origin}/reset-password/${resetData.value?.token_reset_password}`
      modal.disabled = true
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      modal.loading = false
    }
  }

  onMounted(() => {
    data.text = `На электронный адрес <span class="font-weight-bold">${props.user.email}</span> пользователя <span class="font-weight-bold">${props.user.name}</span> будет отправлено письмо с инструкцией для установки нового пароля`
  })

  defineExpose({ sendRequest })
</script>

<style scoped></style>
