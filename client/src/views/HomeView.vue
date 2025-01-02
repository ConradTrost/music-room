<script setup lang="ts">
import { onMounted } from 'vue'
import { useMusicStore } from '../stores/music'
import AlbumRow from '@/components/AlbumRow.vue'
import { usePlayerStore } from '@/stores/player'

const musicStore = useMusicStore()
const playerStore = usePlayerStore()

onMounted(async () => {
  await musicStore.loadHeavyRotation()
  await musicStore.loadRecentlyAdded()
})
</script>

<template>
  <AlbumRow
    header="Heavy Rotation"
    :content="musicStore.getHeavyRotation"
    @play="({ id, kind }) => playerStore.setQueue({ id, kind })"
  />
  <AlbumRow
    header="Recently Added"
    :content="musicStore.getRecentlyAdded"
    @play="({ id, kind }) => playerStore.setQueue({ id, kind })"
  />
</template>
