<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ScrollPanel } from 'primevue'
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
    <ScrollPanel
      class="w-full overflow-y-hidden"
      style="width: 100%; margin: 1rem"
      :dt="{
        bar: {
          background: '{primary.color}',
        },
      }"
    >
      <div class="max-w-screen-xl m-auto">
        <RouterView />
      </div>
    </ScrollPanel>
  </div>
  <MediaPlayer />
</template>

<style scoped>
#content {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 auto;
  font-weight: normal;
  height: 100vh;
}
</style>
