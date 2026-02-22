<template>
  <v-app-bar class="app-header" color="white" elevation="2">
    <v-app-bar-title class="d-flex align-center ga-2">
      <v-icon color="primary" icon="mdi-timer-sand" />
      <span>Time Tracker</span>
    </v-app-bar-title>
  </v-app-bar>
</template>

<script>
  export default {
    name: 'AppHeader',
  }
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}
</style>
