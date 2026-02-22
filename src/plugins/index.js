/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import router from '@/router'
import store from '@/store'
// Plugins
import vuetify from './vuetify'

export function registerPlugins (app) {
  app.use(vuetify).use(router).use(store)
}
