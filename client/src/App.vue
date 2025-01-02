<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ScrollPanel } from 'primevue'
import NavBar from '@/components/NavBar.vue'
import { useAppStore } from './stores/app'
import { onMounted } from 'vue'
import MediaPlayer from './components/MediaPlayer.vue'

const appStore = useAppStore()

onMounted(async () => {
  await appStore.loadMusicKit()
})
</script>

<template>
  <div class="flex w-screen" v-if="appStore.isMusicKitLoaded">
    <NavBar />

    <ScrollPanel
      id="content"
      class="grow overflow-hidden"
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
    <MediaPlayer class="shrink" />
  </div>
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
