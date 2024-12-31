<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import Menu from 'primevue/menu'

import { useAppStore } from '@/stores/app'

const { isUserAuthorized } = defineProps<{ isUserAuthorized: boolean }>()

const appStore = useAppStore()

const login = async () => {
  await appStore.musicKit?.authorize()
}
const logout = async () => {
  await appStore.musicKit?.unauthorize()
}
const menu = ref()
const items = ref([
  {
    label: 'Home',
    icon: 'fa fa-home',
    route: '/',
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
  },
  {
    label: 'Settings',
    icon: 'fa fa-gear',
    route: '/logout',
  },
])
</script>

<template>
  <Menu :model="items">
    <template #item="{ item, props }">
      <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <font-awesome-icon :icon="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </RouterLink>
      <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>
