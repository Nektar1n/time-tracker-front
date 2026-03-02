/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
import { en, ru } from 'vuetify/locale'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: 'ru',
    fallback: 'en',
    messages: { en, ru, 'ru-RU': ru },
  },
  theme: {
    defaultTheme: 'system',
  },
})
