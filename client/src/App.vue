<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useMusicStore } from './stores/music'
import MediaPill from './components/MediaPill.vue'

const musicStore = useMusicStore()
</script>

<template>
  <RouterView />
  <MediaPill v-if="musicStore.nowPlaying.id" />
</template>
