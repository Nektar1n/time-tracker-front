import { computed, reactive } from 'vue'

const STORAGE_KEY = 'time-tracker:categories'

const defaultCategories = [
  { id: 'run', name: 'Бег', emoji: '🏃' },
  { id: 'work', name: 'Работа', emoji: '💼' },
  { id: 'holiday', name: 'Праздник', emoji: '🎉' },
  { id: 'meeting', name: 'Совещание', emoji: '🗓️' },
  { id: 'hobby', name: 'Хобби', emoji: '🎨' },
  { id: 'study', name: 'Учёба', emoji: '📚' },
  { id: 'sport', name: 'Спортзал', emoji: '🏋️' },
  { id: 'family', name: 'Семья', emoji: '👨‍👩‍👧‍👦' },
  { id: 'friends', name: 'Встреча с друзьями', emoji: '🤝' },
  { id: 'travel', name: 'Путешествие', emoji: '✈️' },
  { id: 'health', name: 'Здоровье', emoji: '🩺' },
  { id: 'food', name: 'Еда', emoji: '🍽️' },
  { id: 'reading', name: 'Чтение', emoji: '📖' },
  { id: 'movie', name: 'Кино', emoji: '🎬' },
  { id: 'music', name: 'Музыка', emoji: '🎵' },
  { id: 'shopping', name: 'Покупки', emoji: '🛍️' },
  { id: 'cleaning', name: 'Уборка', emoji: '🧹' },
  { id: 'coding', name: 'Разработка', emoji: '💻' },
  { id: 'rest', name: 'Отдых', emoji: '🛋️' },
  { id: 'sleep', name: 'Сон', emoji: '😴' },
]

const state = reactive({
  categories: [...defaultCategories],
})

function saveCategories () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.categories))
}

function normalizeCategory (category) {
  const name = String(category?.name || '').trim()
  const emoji = String(category?.emoji || '').trim()

  if (!name || !emoji) {
    return null
  }

  return {
    id: category.id || crypto.randomUUID(),
    name,
    emoji,
  }
}

function loadCategories () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      saveCategories()
      return
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      saveCategories()
      return
    }

    const normalized = parsed
      .map(item => normalizeCategory(item))
      .filter(Boolean)

    state.categories = normalized.length > 0 ? normalized : [...defaultCategories]
    saveCategories()
  } catch {
    state.categories = [...defaultCategories]
    saveCategories()
  }
}

function addCategory ({ name, emoji }) {
  const normalizedName = String(name || '').trim()
  const normalizedEmoji = String(emoji || '').trim()
  if (!normalizedName || !normalizedEmoji) {
    return false
  }

  const exists = state.categories.some(
    item => item.name.toLowerCase() === normalizedName.toLowerCase(),
  )
  if (exists) {
    return false
  }

  state.categories.unshift({
    id: crypto.randomUUID(),
    name: normalizedName,
    emoji: normalizedEmoji,
  })
  saveCategories()
  return true
}

const emojiOptions = computed(() => {
  const emojis = [...new Set(defaultCategories.map(item => item.emoji))]
  return emojis.map(emoji => ({
    title: emoji,
    value: emoji,
  }))
})

const categoryOptions = computed(() =>
  state.categories.map(item => ({
    value: item.id,
    title: `${item.emoji} ${item.name}`,
  })),
)

function getCategoryById (categoryId) {
  return state.categories.find(item => item.id === categoryId) || null
}

loadCategories()

export {
  addCategory,
  categoryOptions,
  emojiOptions,
  getCategoryById,
  state,
}
