import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PopularView from '@/views/PopularView.vue'
import RecommendedView from '@/views/RecommendedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
    },
  ],
})

export default router
