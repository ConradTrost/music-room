<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { RouterLink } from 'vue-router'

const { isUserAuthorized } = defineProps<{ isUserAuthorized: boolean }>()

const appStore = useAppStore()

const login = async () => {
  await appStore.musicKit?.authorize()
}
const logout = async () => {
  await appStore.musicKit?.unauthorize()
}
</script>

<template>
  <nav id="nav">
    <ul>
      <li>
        <RouterLink to="/">Home</RouterLink>
      </li>
      <li>
        <RouterLink to="/popular">Top Charts</RouterLink>
      </li>
      <li>
        <RouterLink to="/recommended">Recommended</RouterLink>
      </li>
      <li v-if="!isUserAuthorized">
        <a href="#" v-on:click="login">Login Apple Music</a>
      </li>
      <li v-if="!!isUserAuthorized">
        <a href="#" v-on:click="logout">Logout Apple Music</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
#nav {
  position: sticky;
  min-width: 15vw;
  height: 100vh;
  border-right: 2px solid rgb(226, 184, 47);
  padding: 0;
  margin: 0;
}
#nav ul {
  padding: 0;
  margin: 0;
}
#nav li {
  list-style: none;
  width: 100%;
  border-bottom: 1px solid #ebebeba3;
  padding: 1rem;
}
#nav a {
  height: 100%;
  text-decoration: none;
  color: #fff;
  width: 100%;
}
</style>
