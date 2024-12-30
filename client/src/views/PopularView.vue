<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMusicStore } from '../stores/music'
import AlbumRow from '@/components/AlbumRow.vue'
import { usePlayerStore } from '@/stores/player'

const musicStore = useMusicStore()
const playerStore = usePlayerStore()

const loadMusic = async (genreId?: number) => {
  await musicStore.loadGenres()
  await musicStore.loadChartAlbums(genreId)
  await musicStore.loadChartPlaylists()
  await musicStore.loadChartSongs(genreId)
}

onMounted(async () => {
  await loadMusic()
})

const selected = ref('')
</script>

<template>
  <div class="wrapper">
    <select v-model="selected" @change="loadMusic(parseInt(selected))">
      <option disabled value="">Please select one</option>
      <option selected>All</option>
      <option v-for="genre in musicStore.getGenres" v-bind:key="genre.id" :value="genre.id">
        {{ genre.attributes?.name }}
      </option>
    </select>
    <AlbumRow
      header="Albums"
      :content="musicStore.getChartAlbums"
      @play="({ id, kind }) => playerStore.playMusic({ id, kind })"
    />
    <AlbumRow
      header="Songs"
      :content="musicStore.getChartSongs"
      @play="({ id, kind }) => playerStore.playMusic({ id, kind })"
    />
    <AlbumRow
      header="Playlists"
      :content="musicStore.getChartPlaylists"
      @play="({ id, kind }) => playerStore.playMusic({ id, kind })"
    />
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 100%;
}
</style>
