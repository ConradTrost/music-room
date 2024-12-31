<script setup lang="ts">
import { RouterView } from 'vue-router'
import MediaPill from './components/MediaPill.vue'
import NavBar from '@/components/NavBar.vue'
import { useAppStore } from './stores/app'
import { usePlayerStore } from './stores/player'
import { onMounted } from 'vue'
import MediaPlayer from './components/MediaPlayer.vue'

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
    <div id="inner-content">
      <RouterView />
    </div>
  </div>
  <MediaPlayer />
  <!-- <MediaPill /> -->
</template>

<style scoped>
#content {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2rem;
  /* padding: 2rem 28rem 12rem 8rem; */
  margin: 0 auto;
  font-weight: normal;
  height: 100vh;
  overflow-y: auto;
}
#inner-content {
  max-width: 1280px;
}
</style>
