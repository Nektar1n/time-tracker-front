<script setup>
import { computed, inject, ref } from 'vue'

const modal = inject('modal')

const componentRef = ref(null)

const _clickOK = () => {
  const fnToCall =
    typeof modal.currentModal.settings?.buttonOK?.action === 'function'
      ? modal.currentModal.settings.buttonOK.action
      : typeof componentRef.value?.action === 'function'
        ? componentRef.value.action
        : typeof modal.currentModal.settings?.buttonOK?.action === 'string'
          ? componentRef.value[modal.currentModal.settings.buttonOK.action]
          : undefined

  if (typeof fnToCall === 'function') {
    fnToCall()
  }
}

const showOK = computed(() => modal.currentModal.settings.buttonOK.show ?? true)
</script>

<template>
  <v-dialog
    v-model="modal.currentModal.visible"
    :persistent="modal.persistent"
    :max-width="modal.currentModal.settings.maxWidth"
    :fullscreen="modal.currentModal.settings.fullScreen"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5 text-medium-emphasis ps-2">
          {{ modal.currentModal.settings.title || 'Без заголовка' }}
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="modal.loading"
          @click="modal.close()"
        ></v-btn>
      </v-card-title>
      <v-card-text>
        <component
          :is="modal.currentModal.settings.component"
          v-bind="modal.currentModal.settings.props || null"
          ref="componentRef"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          @click="_clickOK()"
          :loading="modal.loading"
          :disabled="modal.currentModal.settings.disabled"
          v-if="showOK"
        >
          {{ modal.currentModal.settings.buttonOK?.title || 'OK' }}
        </v-btn>
        <v-btn @click="modal.close()" :disabled="modal.loading">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
