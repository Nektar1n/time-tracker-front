<template>
  <v-card>
    <v-card-title>Вход в программу</v-card-title>
    <v-form>
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="5" class="align-center">
            <v-img :src="asset('logo.png')" class="my-3" contain height="170" />
          </v-col>
          <v-col cols="12" md="7" align-self="center">
            <v-text-field
              density="comfortable"
              variant="outlined"
              label="E-mail"
              v-model.trim="form['username'].value"
              :error-messages="form['username'].error"
              class="my-2"
              autocomplete="off"
            />
            <v-text-field
              density="comfortable"
              variant="outlined"
              label="Пароль"
              v-model.trim="form['password'].value"
              :error-messages="form['password'].error"
              class="my-2"
              autocomplete="off"
              :append-icon="show ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
              :type="show ? 'text' : 'password'"
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
        @click="_auth()"
        :loading="modal.loading"
        :disabled="!_formValid()"
      >
        Войти
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useNavigation } from '@/modules/nvaigation/useNavigation.js'
import { useRouter } from 'vue-router'
import { useFormDrawer } from '@/modules/forms/useFormDrawer.js'
import { isEmail, required } from '@/modules/forms/validationRules.js'
import { useAuthDrawer } from '@/modules/auth/useAuthDrawer.js'

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

async function _auth() {
  modal.loading = true
  try {
    await login(formData())
    modal.close()
  } catch (e) {
    console.log('ERROR', e)
  } finally {
    modal.loading = false
  }
}
</script>

<style scoped></style>
