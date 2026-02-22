<template>
  <v-row dense :key="renderKey">
    <v-col cols="12" md="6">
      <v-card title="Список пользователей">
        <template v-slot:prepend>
          <v-icon icon="mdi-account-group"></v-icon>
        </template>
        <v-card-text>
          <user-list-component
            v-model:selected="selected"
            :edit-flag="editFlag"
            @update:selected="_selected"
          />
        </v-card-text>
        <template v-slot:append>
          <div v-show="editFlag">
            <v-btn
              density="comfortable"
              color="green"
              :disabled="!editFlag"
              class="ml-1"
              title="Сохранить настройки"
              @click="_updateUser"
              :loading="loading"
            >
              <v-icon size="25">mdi-content-save-outline</v-icon>
            </v-btn>
            <v-btn
              class="ml-1"
              density="comfortable"
              :disabled="!editFlag"
              @click="_cancelEdit"
              title="Отмена"
            >
              <v-icon size="25">mdi-close</v-icon>
            </v-btn>
          </div>
          <div v-show="!editFlag">
            <v-btn
              color="primary"
              density="comfortable"
              class="ml-1"
              :disabled="editFlag || Object.keys(selected).length === 0"
              @click="_enterEdit"
              title="Редактировать пользователя"
            >
              <v-icon size="25">mdi-account-edit-outline</v-icon>
            </v-btn>
            <v-btn
              density="comfortable"
              class="ml-1"
              :disabled="editFlag"
              title="Добавить пользователя"
              @click="modalManager.open('appendUser')"
            >
              <v-icon size="25">mdi-account-plus</v-icon>
            </v-btn>
          </div>
        </template>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-row dense>
        <v-col cols="12">
          <v-card
            title="Роли пользователя"
            prepend-icon="mdi-security"
            :disabled="!editFlag"
          >
            <user-roles-component
              :roles="selected.roles"
              @update:roles="_updateRoles"
            />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card
            title="Информация о пользователе"
            prepend-icon="mdi-card-account-details-outline"
            :disabled="!editFlag"
          >
            <v-card-text>
              <user-card-component :data="selected" @change="_cardChange" />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card
            title="Проекты пользователя"
            prepend-icon="mdi-camera-document"
            :disabled="!editFlag"
          >
            <v-card-text>
              <v-data-table
                :items="selected.cr_entities"
                :headers="[
                  { key: 'disease', title: 'Заболевание' },
                  { key: 'profile', title: 'Профиль' },
                  { key: 'ageCategory', title: 'Возрастная группа' },
                ]"
                hide-default-footer
              ></v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <modal-wrapper-template />
  </v-row>
</template>

<script setup>
import UserListComponent from '@setup/setup-users/components/UserListComponent.vue'
import { computed, onMounted, provide, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useUserDrawer } from '@setup/setup-users/hook/useUserDrawer.js'
import UserRolesComponent from '@setup/setup-users/components/UserRolesComponent.vue'
import UserCardComponent from '@/modules/setup/setup-users/components/UserCardComponent.vue'
import { ModalManager } from '@/modules/modals/ModalManager.js'
import ModalWrapperTemplate from '@/modules/modals/ModalWrapperTemplate.vue'
import AppendUserModal from '@/modules/setup/setup-users/components/AppendUserModal.vue'
import ResetPasswordModal from '@/modules/setup/setup-users/components/ResetPasswordModal.vue'

const toast = useToast()
const { loading, initUserList, renderKey, updateUser, userList, appendUser } =
  useUserDrawer()

const selected = ref({})
const saveObject = ref({})
const oldObject = ref({})
const editFlag = ref(false)

const _selected = v =>
  (saveObject.value = { ...v, roles: v.roles.map(({ value }) => value) })

const _updateRoles = newRoles => (saveObject.value.roles = [...newRoles])

const _enterEdit = () => {
  oldObject.value = { ...selected.value }
  editFlag.value = true
}

const _cancelEdit = () => {
  selected.value = { ...oldObject.value }
  editFlag.value = false
  oldObject.value = {}
  renderKey.value += 1
}

const _updateUser = async () => {
  try {
    loading.value = true
    await updateUser(saveObject.value)
    selected.value = userList.value.find(f => f.id === selected.value.id)
    editFlag.value = false
    oldObject.value = {}
    toast.success('Настройки пользователя сохранены')
  } catch (e) {
    toast.error(e.message || e)
  } finally {
    loading.value = false
  }
}

const _cardChange = data => {
  const { roles, ...rest } = data
  saveObject.value = { ...saveObject.value, ...rest }
}

const modalManager = new ModalManager()

modalManager.addModal('appendUser', {
  title: 'Добавляем пользователя',
  component: AppendUserModal,
  buttonOK: {
    title: 'Добавить',
    action: async () => {
      try {
        modalManager.loading = true
        const payload = JSON.parse(modalManager.data)
        await appendUser(payload)
        toast.success('Пользователь добавлен')
        modalManager.close()
      } catch (e) {
        toast.error(e.message || e)
      } finally {
        modalManager.loading = false
      }
    },
  },
})

modalManager.addModal('resetPassword', {
  title: 'Сброс пароля пользователя',
  maxWidth: 900,
  component: ResetPasswordModal,
  props: {
    user: computed(() => selected.value),
  },
  buttonOK: { title: 'Сбросить', action: 'sendRequest' },
})

provide('modal', modalManager)

onMounted(async () => {
  try {
    loading.value = true
    await initUserList()
  } catch (e) {
    toast.error(e.message || e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped></style>
