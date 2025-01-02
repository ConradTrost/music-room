<script setup lang="ts">
import { onMounted } from 'vue'
import { useMusicStore } from '../stores/music'
import AlbumRow from '@/components/AlbumRow.vue'
import { usePlayerStore } from '@/stores/player'

const musicStore = useMusicStore()
const playerStore = usePlayerStore()

onMounted(async () => {
  await musicStore.loadRecommended()
})
</script>

<template>
  <div v-for="rec in musicStore.getRecommendations" v-bind:key="rec.id">
    <AlbumRow
      :header="rec.title"
      :content="rec.relationships"
      @play="({ id, kind }) => playerStore.setQueue({ id, kind })"
    />
  </div>
</template>
