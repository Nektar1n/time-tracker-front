import { createStore } from 'vuex'

import authorizationStore from '@/modules/auth/store'
import userStore from '@/modules/setup/setup-users/store'

// const { updateTree } = useEntityTreeDrawer();

const store = createStore({
  actions: {
    CLEAR_ALL_STATE: async () => {
      for (const key of Object.keys(store._modules.root._children)) {
        const module = store._modules.root._children[key]
        module.checkMutation = function (name) {
          return Object.keys(module._rawModule.mutations).includes(name)
        }

        if (module.checkMutation('CLEAR_STORE')) {
          module.context.commit('CLEAR_STORE')
        }
      }
    },
  },
  modules: {
    authStore: authorizationStore,
    userStore,
  },
})

// store.subscribe(async (mutation, state) => {
//   const m = mutation.type.split("/").concat(Array(2).fill(null));
//   switch (m[1]) {
//     case "UPDATE_PASSPORT_VALUE": {
//       const update =
//         state[m[0]].passport.find((f) => f.id === mutation.payload.total.ps_id)
//           ?.ps_data?.updateTree || false;
//       if (update) {
//         await updateTree();
//       }
//     }
//   }
// });

export default store
