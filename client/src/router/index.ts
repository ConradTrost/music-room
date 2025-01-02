import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PopularView from '@/views/PopularView.vue'
import RecommendedView from '@/views/RecommendedView.vue'
import { useAppStore } from '@/stores/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/popular',
      name: 'popular',
      component: PopularView,
    },
    {
      path: '/recommended',
      name: 'recommended',
      component: RecommendedView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const appStore = useAppStore()
  if (to.meta.requiresAuth && !appStore.isUserAuthorized) {
    return { name: 'popular' }
  }
})

export default router
