<script setup lang="ts">
import { RouterView } from 'vue-router'
import MediaPill from './components/MediaPill.vue'
import NavBar from '@/components/NavBar.vue'
import { useAppStore } from './stores/app'
import { usePlayerStore } from './stores/player'
import { onMounted } from 'vue'

const playerStore = usePlayerStore()
const appStore = useAppStore()

onMounted(async () => {
  await appStore.loadMusicKit()
  console.log('music kit loaded prob')
  playerStore.attachEvents()
})
</script>

<template>
  <NavBar :isUserAuthorized="appStore.isUserAuthorized" />

  <div id="content" v-if="appStore.isUserAuthorized">
    <RouterView />
  </div>
  <MediaPill />
</template>

<style scoped>
#content {
  padding: 2rem 28rem 12rem 8rem;
  margin: 0 auto;
  font-weight: normal;
  height: 100vh;
  overflow-y: auto;
}
</style>
