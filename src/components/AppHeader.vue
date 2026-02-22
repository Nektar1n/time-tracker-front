<template>
  <v-app-bar class="app-header" color="white" elevation="2">
    <v-app-bar-title class="d-flex align-center ga-2">
      <v-icon color="primary" icon="mdi-timer-sand" />
      <span>Time Tracker</span>
    </v-app-bar-title>

    <v-tabs
      :model-value="activeTab"
      align-tabs="end"
      color="primary"
      density="comfortable"
    >
      <v-tab value="home" to="/">Главная</v-tab>
      <v-tab value="active-timers" to="/active-timers">Активные таймеры</v-tab>
    </v-tabs>
  </v-app-bar>
</template>

<script>
  export default {
    name: 'AppHeader',
    computed: {
      activeTab () {
        return this.$route.path === '/active-timers' ? 'active-timers' : 'home'
      },
    },
  }
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}
</style>
