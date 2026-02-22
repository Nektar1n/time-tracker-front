<script setup>
import { inject } from 'vue'

const modal = inject('modal')
</script>

<template>
  <v-dialog
    v-model="modal.currentModal.visible"
    :persistent="modal.persistent"
    :max-width="modal.currentModal.settings.maxWidth"
    :fullscreen="modal.currentModal.settings.fullScreen"
  >
    <component :is="modal.currentModal.settings.component" />
  </v-dialog>
</template>
