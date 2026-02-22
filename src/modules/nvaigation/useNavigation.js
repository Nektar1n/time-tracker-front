import { ref } from 'vue'
import { useRouter } from 'vue-router'

const drawer = ref(true)

export function useNavigation() {
  const router = useRouter()

  const pow = list =>
    list
      .filter(item => item.meta?.menu)
      .map(item => ({
        ...item,
        children: Array.isArray(item.children) ? pow(item.children) : undefined,
      }))

  const asset = name => new URL(`/src/assets/img/${name}`, import.meta.url).href

  return {
    menu: pow(router.options.routes),
    drawer,
    asset,
  }
}
