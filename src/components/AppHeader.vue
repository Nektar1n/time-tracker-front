<template>
  <v-app-bar class="app-header" color="white" elevation="2">
    <v-app-bar-title class="d-flex align-center ga-2">
      <v-icon color="primary" icon="mdi-timer-sand" />
      <span>Time Tracker</span>
    </v-app-bar-title>

    <v-tabs
      align-tabs="end"
      color="primary"
      density="comfortable"
      :model-value="activeTab"
    >
      <v-tab to="/" value="home">Главная</v-tab>
      <v-tab to="/active-timers" value="active-timers">Активные таймеры</v-tab>
      <v-tab to="/statistics" value="statistics">Статистика</v-tab>
      <v-tab to="/dictionaries" value="dictionaries">Категории</v-tab>
    </v-tabs>

    <v-menu :close-on-content-click="false" location="bottom end" min-width="640">
      <template #activator="{ props }">
        <v-btn
          class="ml-3"
          color="primary"
          prepend-icon="mdi-account-group"
          variant="outlined"
          v-bind="props"
        >
          Совместный календарь
        </v-btn>
      </template>

      <v-sheet class="pa-3" rounded="lg" width="640">
        <v-row>
          <v-col cols="12" md="7">
            <personal-cabinet @users-update="onUsersUpdate" />
          </v-col>
          <v-col cols="12" md="5">
            <connected-users-list :users="connectedUsers" />
          </v-col>
        </v-row>
      </v-sheet>
    </v-menu>
  </v-app-bar>
</template>

<script>
  import ConnectedUsersList from './ConnectedUsersList.vue'
  import PersonalCabinet from './PersonalCabinet.vue'

  export default {
    name: 'AppHeader',
    components: {
      ConnectedUsersList,
      PersonalCabinet,
    },
    data: () => ({
      connectedUsers: [],
    }),
    computed: {
      activeTab () {
        if (this.$route.path === '/active-timers') return 'active-timers'
        if (this.$route.path === '/statistics') return 'statistics'
        if (this.$route.path === '/dictionaries') return 'dictionaries'
        return 'home'
      },
    },
    methods: {
      onUsersUpdate (users) {
        this.connectedUsers = users
      },
    },
  }
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}
</style>
