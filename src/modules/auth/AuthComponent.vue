<template>
  <v-card>
    <v-card-title>Вход в программу</v-card-title>
    <v-form>
      <v-container fluid>
        <v-row>
          <v-col class="align-center" cols="12" md="5">
            <v-img class="my-3" contain height="170" :src="asset('logo.png')" />
          </v-col>
          <v-col align-self="center" cols="12" md="7">
            <v-text-field
              v-model.trim="form['username'].value"
              autocomplete="off"
              class="my-2"
              density="comfortable"
              :error-messages="form['username'].error"
              label="E-mail"
              variant="outlined"
            />
            <v-text-field
              v-model.trim="form['password'].value"
              autocomplete="off"
              :append-icon="show ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
              class="my-2"
              density="comfortable"
              :error-messages="form['password'].error"
              label="Пароль"
              :type="show ? 'text' : 'password'"
              variant="outlined"
              @click:append="show = !show"
              @keyup.enter="_formValid() ? _auth() : null"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <v-card-actions>
      <v-spacer />
      <v-btn
        :disabled="!_formValid()"
        :loading="modal.loading"
        @click="_auth()"
      >
        Войти
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthDrawer } from '@/modules/auth/useAuthDrawer.js'
  import { useFormDrawer } from '@/modules/forms/useFormDrawer.js'
  import { isEmail, required } from '@/modules/forms/validationRules.js'
  import { useNavigation } from '@/modules/nvaigation/useNavigation.js'

  const { asset } = useNavigation()
  const { login } = useAuthDrawer()

  const router = useRouter()
  const dm = reactive({
    loading: false,
    close: async () => await router.push('/entities/list'),
  })
  const props = defineProps({ modal: { type: Object } })
  const modal = props.modal || dm
  const show = ref(false)
  const { form, _formValid, formData } = useFormDrawer({
    username: {
      value: '',
      validators: { required, isEmail },
    },
    password: {
      value: '',
      validators: { required },
    },
  })

  async function _auth () {
    modal.loading = true
    try {
      await login(formData())
      modal.close()
    } catch (error) {
      console.log('ERROR', error)
    } finally {
      modal.loading = false
    }
  }
</script>

<style scoped></style>
