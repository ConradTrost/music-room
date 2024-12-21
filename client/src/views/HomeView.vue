<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useMusicStore } from '../stores/music'
import UserLogin from '@/components/UserLogin.vue'
import UserLogout from '@/components/UserLogout.vue'

const musicStore = useMusicStore()

watch(
  () => musicStore.isUserAuthorized,
  (newValue, oldValue) => {
    console.log('getter value changed', newValue, oldValue)
  },
)

onMounted(async () => {
  await musicStore.loadMusicKit()
  // await musicStore.authorizeUser()
  // await musicStore.getHeavyRotation()
  //   await musicStore.getPlaylists()
})
</script>

<template>
  <UserLogin v-if="!musicStore.isUserAuthorized" />
  <UserLogout v-if="musicStore.isUserAuthorized" />
  <div v-if="musicStore.isUserAuthorized">
    hello
    <div class="heavy-rotation" v-for="music in musicStore.heavyRotation" v-bind:key="music.id">
      <img
        :class="{ active: music.id == musicStore.activeMusicId }"
        v-on:click="musicStore.playMusic(music.attributes.playParams)"
        :src="musicStore.getAlbumArtwork(music.attributes.artwork, 320)"
      />
      <h3>{{ music.attributes.name }}</h3>
      <b>{{ music.attributes.artistName }}</b>
    </div>

    <div class="playlists" v-for="music in musicStore.playlists" v-bind:key="music.id">
      <!-- <img
        :class="{ active: music.id == musicStore.activeMusicId }"
        v-on:click="musicStore.playMusic(music.attributes.playParams)"
        :src="musicStore.getAlbumArtwork(music.attributes.artwork, 320)"
      /> -->
      <h3>{{ music.attributes.name }}</h3>
      <!-- <b>{{ music.attributes.artistName }}</b> -->
    </div>
  </div>
</template>

<style scoped>
.heavy-rotation img.active {
  border: 1px solid red;
}
.heavy-rotation img:hover {
  cursor: pointer;
}
</style>
