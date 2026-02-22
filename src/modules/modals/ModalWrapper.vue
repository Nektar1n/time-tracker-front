<template>
  <v-dialog
    :fullscreen="modal.fullscreen"
    :hide-overlay="modal.hideOverlay"
    :max-width="modal.maxWidth"
    :model-value="modal.state"
    :persistent="modal.persistent || modal.loading"
    @click:outside="!modal.persistent && !modal.loading ? modal.close() : null"
    @close="_close2"
  >
    <component
      :is="modal.cmp"
      v-if="modal.cmp"
      :modal="modal"
      @close="_close1"
    />
    <slot v-else />
  </v-dialog>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    modal: { required: true },
  })

  const show = ref(props.modal.state)

  watch(
    () => props.modal.state,
    f => {
      if (!f)
        setTimeout(() => {
          props.modal.close()
          return (show.value = false)
        }, 120)
    },
  )

  const emit = defineEmits(['close'])

  function _close1 (data = null) {
    console.log('close from modal wrapper 1', data)
    emit('close', data)
  }
  function _close2 () {
    console.log('close from modal wrapper 2')
  }
</script>

<style scoped></style>
