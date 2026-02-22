<script setup>
  import { inject } from 'vue'

  const modal = inject('modal')
</script>

<template>
  <v-dialog
    v-model="modal.currentModal.visible"
    :fullscreen="modal.currentModal.settings.fullScreen"
    :max-width="modal.currentModal.settings.maxWidth"
    :persistent="modal.persistent"
  >
    <component :is="modal.currentModal.settings.component" />
  </v-dialog>
</template>
