<script setup lang="ts">
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()

const login = async () => {
  console.log('logging in user')
  await musicStore.musicKit?.authorize()
  console.log('logged in')
}
</script>

<template>
  <button v-on:click="login">Login to Apple Music</button>
</template>

<style scoped></style>
