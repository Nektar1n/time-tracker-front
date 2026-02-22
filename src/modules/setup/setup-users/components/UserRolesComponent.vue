<template>
  <v-data-table
    v-model="selected"
    :items="rolesList"
    :headers="headers"
    item-value="value"
    show-select
    density="comfortable"
    hide-default-footer
    @update:model-value="$emit('update:roles', selected)"
  >
    <template v-slot:header.data-table-select>
      <span />
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserDrawer } from '@/modules/setup/setup-users/hook/useUserDrawer.js'

const props = defineProps({ roles: { type: Array, default: () => [] } })
//TODO загружать роли с сервера
const { rolesList } = useUserDrawer()
const selected = ref([...props.roles.map(({ value }) => value)])
const headers = [
  { key: 'id', title: 'ИД' },
  { key: 'value', title: 'Ключ' },
  { key: 'name', title: 'Название' },
  { key: 'description', title: 'Описание' },
]

watch(
  () => props.roles,
  newRoles => {
    selected.value = newRoles.map(({ value }) => value)
  }
)
</script>

<style scoped></style>
