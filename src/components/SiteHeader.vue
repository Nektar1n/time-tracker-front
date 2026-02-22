<template>
  <v-app-bar class="site-header" flat>
    <v-container class="d-flex align-center justify-space-between py-0" max-width="1200">
      <div class="text-h6 font-weight-bold">Time Tracker</div>
      <v-btn-toggle
        v-model="activeView"
        color="primary"
        density="comfortable"
        mandatory
        rounded="lg"
        variant="tonal"
      >
        <v-btn prepend-icon="mdi-account" value="profile">Личный кабинет</v-btn>
        <v-btn prepend-icon="mdi-timer-outline" value="timer">Таймер</v-btn>
        <v-btn prepend-icon="mdi-calendar-month" value="calendar">Календарь</v-btn>
      </v-btn-toggle>
    </v-container>
  </v-app-bar>
</template>

<script>
  export default {
    name: 'SiteHeader',
    props: {
      modelValue: {
        type: String,
        default: 'timer',
      },
    },
    emits: ['update:modelValue'],
    computed: {
      activeView: {
        get () {
          return this.modelValue
        },
        set (value) {
          this.$emit('update:modelValue', value)
        },
      },
    },
  }
</script>

<style scoped>
.site-header {
  border-bottom: 1px solid rgb(0 0 0 / 8%);
}
</style>
