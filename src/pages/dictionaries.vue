<template>
  <v-container class="py-6" max-width="900">
    <h2 class="mb-4">Категории</h2>

    <v-card rounded="lg">
      <v-card-title>Категории</v-card-title>
      <v-card-text>
        <v-form class="d-flex flex-wrap align-end ga-3 mb-4" @submit.prevent="onAddCategory">
          <v-text-field
            v-model="form.name"
            class="flex-grow-1"
            label="Название категории"
            minlength="2"
            required
          />
          <v-select
            v-model="form.emoji"
            class="emoji-input"
            item-title="title"
            item-value="value"
            :items="emojiOptions"
            label="Эмодзи"
            required
          />
          <v-btn color="primary" type="submit">Добавить</v-btn>
        </v-form>

        <v-alert
          v-model="showExistsWarning"
          closable
          density="comfortable"
          text="Категория с таким названием уже существует или данные невалидны"
          type="warning"
          variant="tonal"
        />

        <v-list lines="two">
          <v-list-item
            v-for="item in categories"
            :key="item.id"
            :subtitle="`id: ${item.id}`"
            :title="item.name"
          >
            <template #prepend>
              <span class="text-h5">{{ item.emoji }}</span>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
  import { addCategory, emojiOptions, state } from '@/modules/categories/categoryState'

  export default {
    name: 'DictionariesPage',
    data: () => ({
      form: {
        name: '',
        emoji: '',
      },
      showExistsWarning: false,
    }),
    computed: {
      categories () {
        return state.categories
      },
      emojiOptions () {
        return emojiOptions.value
      },
    },
    methods: {
      onAddCategory () {
        const ok = addCategory(this.form)
        if (!ok) {
          this.showExistsWarning = true
          return
        }

        this.form = {
          name: '',
          emoji: '',
        }
        this.showExistsWarning = false
      },
    },
  }
</script>

<style scoped>
.emoji-input {
  max-width: 130px;
}
</style>
