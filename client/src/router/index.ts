import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PopularView from '@/views/PopularView.vue'
import RecommendedView from '@/views/RecommendedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'bg-primary',
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

router.beforeEach((to) => {
  const isUserAuthorized = Boolean(localStorage.getItem('isUserAuthorized'))
  if (to.meta.requiresAuth && !isUserAuthorized) {
    return { name: 'popular' }
  }
})

export default router
