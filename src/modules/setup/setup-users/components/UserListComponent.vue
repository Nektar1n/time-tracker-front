<template>
  <v-data-table
    :loading="loading"
    :items="userList"
    :headers="headers"
    :search="search"
    hover
    density="comfortable"
    @click:row="rowClick"
    :row-props="rowProps"
    :hide-default-footer="!hdf"
  >
    <template v-slot:top>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        autocomplete="off"
        :disabled="editFlag"
      />
    </template>
  </v-data-table>
</template>

<script setup>
import { useUserDrawer } from '@/modules/setup/setup-users/hook/useUserDrawer.js'
import { computed, ref } from 'vue'

const { userList, loading } = useUserDrawer()

const props = defineProps({
  selected: { type: Object },
  editFlag: { type: Boolean, default: false },
})
const emit = defineEmits(['update:selected'])

const headers = [
  { key: 'id', title: 'ИД', width: '100px' },
  { key: 'name', title: 'Имя', width: '50%' },
  { key: 'email', title: 'E-mail', width: '50%' },
]
const hdf = computed(() => Boolean(userList.value.length > 10))
const search = ref(null)

const rowClick = (_, { item }) => {
  if (props.editFlag === true) return false
  emit('update:selected', item)
}

const rowProps = ({ item }) => {
  if (item.id === props.selected?.id) {
    return {
      class: `${props.editFlag ? 'user-selected-row-edit' : 'user-selected-row'}`,
    }
  }
}
</script>

<style scoped>
:deep(.user-selected-row) {
  color: black;
  font-weight: bold;
  background: #e5e7ebff;
}
:deep(.user-selected-row-edit) {
  color: black;
  font-weight: bold;
  background: #dfffff;
}
</style>
