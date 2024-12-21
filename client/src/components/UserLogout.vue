<script setup lang="ts">
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()

const logout = async () => {
  await musicStore.musicKit?.unauthorize()
}
</script>

<template>
  <button v-on:click="logout">Logout Apple Music</button>
</template>

<style scoped></style>
