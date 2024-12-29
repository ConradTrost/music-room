<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useMusicStore, type MusicData } from '../stores/music'
import UserLogin from '@/components/UserLogin.vue'
import UserLogout from '@/components/UserLogout.vue'
import AlbumRow, { type Album } from '@/components/AlbumRow.vue'

const musicStore = useMusicStore()

const getAlbums = (data: MusicData[]): Album[] => {
  return data.map((val) => ({
    id: val.id,
    title: val.attributes.name,
    artist: val.attributes.artistName,
    imageUrl: musicStore.getAlbumArtwork(val.attributes.artwork, 236),
  }))
}

watch(
  () => musicStore.isUserAuthorized,
  (newValue, oldValue) => {
    console.log('getter value changed', newValue, oldValue)
  },
)

onMounted(async () => {
  await musicStore.loadMusicKit()
  // await musicStore.authorizeUser()
  await musicStore.getHeavyRotation()
  await musicStore.getRecentlyAdded()
  //   await musicStore.getPlaylists()
})
</script>

<template>
  <UserLogin v-if="!musicStore.isUserAuthorized" />
  <UserLogout v-if="musicStore.isUserAuthorized" />
  <div class="wrapper" v-if="musicStore.isUserAuthorized">
    <AlbumRow
      header="Heavy Rotations"
      :albums="getAlbums(musicStore.heavyRotation)"
      @play="(id) => musicStore.playMusic({ kind: 'album', id })"
    />
    <AlbumRow
      header="Recently Added"
      :albums="getAlbums(musicStore.recentlyAdded)"
      @play="(id) => musicStore.playMusic({ kind: 'album', id })"
    />
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
.wrapper {
  max-width: 100%;
}
</style>
