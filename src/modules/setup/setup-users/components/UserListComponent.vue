<template>
  <v-data-table
    density="comfortable"
    :headers="headers"
    :hide-default-footer="!hdf"
    hover
    :items="userList"
    :loading="loading"
    :row-props="rowProps"
    :search="search"
    @click:row="rowClick"
  >
    <template #top>
      <v-text-field
        v-model="search"
        autocomplete="off"
        density="compact"
        :disabled="editFlag"
        hide-details
        prepend-inner-icon="mdi-magnify"
      />
    </template>
  </v-data-table>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useUserDrawer } from '@/modules/setup/setup-users/hook/useUserDrawer.js'

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

  function rowClick (_, { item }) {
    if (props.editFlag === true) return false
    emit('update:selected', item)
  }

  function rowProps ({ item }) {
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
