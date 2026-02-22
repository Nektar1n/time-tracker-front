<template>
  <v-navigation-drawer
    v-if="true"
    v-model="drawer"
    expand-on-hover
    rail
    @mouseleave.stop="isRail = false"
    @mouseover.stop="isRail = true"
  >
    <v-list>
      <v-list-item
        :prepend-avatar="asset('cekkmp.svg')"
        subtitle="Экспертиза КР"
        title="ЦЭККМП"
      />
    </v-list>

    <v-divider />

    <v-list density="compact" :disabled="!loggedIn" nav>
      <template v-for="(item, index) in menu" :key="index">
        <v-list-item
          v-if="!item.children"
          :base-color="bc[item.name] || null"
          link
          :prepend-icon="item.meta.icon"
          :title="item.meta.title"
          :to="{ name: item.name }"
          :value="item.meta.title"
        />
        <v-list-group v-else :value="item.name">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.meta.icon"
              :title="item.meta.title"
            />
          </template>
          <v-list-item
            v-for="(child, ci) in item.children"
            :key="ci"
            :base-color="bc[child.name] || null"
            :class="isRail ? 'rail-watch-in' : 'rail-watch-out'"
            density="compact"
            link
            :prepend-icon="child.meta.icon"
            :title="child.meta.title"
            :to="{ name: child.name }"
            :value="child.meta.title"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue'
  import { useAuthDrawer } from '@/modules/auth/useAuthDrawer.js'
  import { useFilterDrawer } from '@/modules/filters/hook/useFilterDrawer.js'
  import { useNavigation } from '@/modules/nvaigation/useNavigation.js'
  import { useReferenceDrawer } from '@/modules/reference/hook/useReferenceDrawer.js'

  const { loggedIn } = useAuthDrawer()
  const { drawer, asset, menu } = useNavigation()
  const { forceDict } = useReferenceDrawer()
  const { isFilters, filters } = useFilterDrawer()
  const isRail = ref(false)

  const bc = reactive({
    'Reference': computed(() => (forceDict.value ? 'red-accent-4' : null)),
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
