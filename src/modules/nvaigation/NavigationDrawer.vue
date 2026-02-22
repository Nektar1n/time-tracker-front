<template>
  <v-navigation-drawer
    v-if="true"
    v-model="drawer"
    expand-on-hover
    rail
    @mouseover.stop="isRail = true"
    @mouseleave.stop="isRail = false"
  >
    <v-list>
      <v-list-item
        :prepend-avatar="asset('cekkmp.svg')"
        title="ЦЭККМП"
        subtitle="Экспертиза КР"
      >
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list density="compact" nav :disabled="!loggedIn">
      <template v-for="(item, index) in menu" :key="index">
        <v-list-item
          v-if="!item.children"
          :prepend-icon="item.meta.icon"
          :title="item.meta.title"
          :value="item.meta.title"
          link
          :to="{ name: item.name }"
          :base-color="bc[item.name] || null"
        />
        <v-list-group :value="item.name" v-else>
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="item.meta.title"
              :prepend-icon="item.meta.icon"
            ></v-list-item>
          </template>
          <v-list-item
            density="compact"
            v-for="(child, ci) in item.children"
            :key="ci"
            :prepend-icon="child.meta.icon"
            :title="child.meta.title"
            :value="child.meta.title"
            :to="{ name: child.name }"
            link
            :class="isRail ? 'rail-watch-in' : 'rail-watch-out'"
            :base-color="bc[child.name] || null"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useNavigation } from '@/modules/nvaigation/useNavigation.js'
import { computed, reactive, ref } from 'vue'
import { useAuthDrawer } from '@/modules/auth/useAuthDrawer.js'
import { useReferenceDrawer } from '@/modules/reference/hook/useReferenceDrawer.js'
import { useFilterDrawer } from '@/modules/filters/hook/useFilterDrawer.js'

const { loggedIn } = useAuthDrawer()
const { drawer, asset, menu } = useNavigation()
const { forceDict } = useReferenceDrawer()
const { isFilters, filters } = useFilterDrawer()
const isRail = ref(false)

const bc = reactive({
  Reference: computed(() => (forceDict.value ? 'red-accent-4' : null)),
  'entities.filter': computed(() => (isFilters.value ? 'cyan-darken-2' : null)),
})
</script>

<style scoped>
.rail-watch-in {
  padding-inline-start: 20px !important;
}
.rail-watch-out {
  padding-inline-start: 9px !important;
  width: 38px;
}
.v-list-item {
  transition: 0.3s;
}
:deep(.v-list-item) > .v-list-item__prepend > .v-list-item__spacer {
  width: 18px !important;
}
</style>
