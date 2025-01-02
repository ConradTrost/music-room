<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Select from 'primevue/select'

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

const selected = ref(null)

watch(selected, () => {
  loadMusic(parseInt(selected.value))
})
</script>

<template>
  <div class="flex justify-between items-center max-w-screen-xl px-16">
    <h1 class="text-2xl font-bold">Top Charts</h1>
    <Select
      v-model="selected"
      :options="musicStore.genres"
      optionLabel="attributes.name"
      optionValue="id"
      showClear
      placeholder="Filter by genre"
    />
  </div>
  <AlbumRow
    header="Albums"
    :content="musicStore.getChartAlbums"
    @play="({ id, kind }) => playerStore.setQueue({ id, kind })"
  />
  <AlbumRow
    header="Songs"
    :content="musicStore.getChartSongs"
    @play="({ id, kind }) => playerStore.setQueue({ id, kind })"
  />
  <AlbumRow
    header="Playlists"
    :content="musicStore.getChartPlaylists"
    @play="({ id, kind }) => playerStore.setQueue({ id, kind })"
  />
</template>
