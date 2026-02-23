<template>
  <v-card class="h-100" variant="tonal">
    <v-card-title class="d-flex align-center ga-2">
      <v-icon icon="mdi-account-multiple" />
      Подключенные пользователи
    </v-card-title>
    <v-divider />
    <v-list v-if="users.length > 0" density="comfortable" lines="two">
      <v-list-item
        v-for="user in users"
        :key="user.id"
        :subtitle="user.id"
        :title="user.name"
      >
        <template #prepend>
          <v-avatar color="primary" size="28">
            {{ user.name.slice(0, 1).toUpperCase() }}
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>
    <v-card-text v-else class="text-medium-emphasis">
      Пока никого нет. Поделитесь ссылкой на календарь.
    </v-card-text>
  </v-card>
</template>

<script setup>
  defineProps({
    users: {
      type: Array,
      default: () => [],
    },
  })
</script>
