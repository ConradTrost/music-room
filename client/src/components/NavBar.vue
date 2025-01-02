<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

const items = ref<MenuItem[]>([
  {
    label: 'Home',
    icon: 'fa fa-home',
    route: '/',
    disabled: () => !appStore.isUserAuthorized,
  },
  {
    label: 'Top Charts',
    icon: 'fa fa-fire-flame-curved',
    route: '/popular',
  },
  {
    label: 'Recommended',
    icon: 'fa fa-bolt',
    route: '/recommended',
    disabled: () => !appStore.isUserAuthorized,
  },
  {
    label: 'Settings',
    icon: 'fa fa-gear',
    command: async () => {
      if (appStore.isUserAuthorized) {
        await appStore.logoutUser()
        router.push('/')
      } else {
        await appStore.loginUser()
        router.push('/')
      }
    },
  },
])
</script>

<template>
  <Menu :model="items" class="h-screen">
    <template #item="{ item, props }">
      <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <font-awesome-icon :icon="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </RouterLink>
      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <font-awesome-icon :icon="item.icon" />
        <span class="ml-2">{{ appStore.isUserAuthorized ? 'Log out' : 'Log in' }}</span>
      </a>
    </template>
  </Menu>
</template>
