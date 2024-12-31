<script setup lang="ts">
import { getAlbumArtwork } from '@/stores/music'
import { usePlayerStore } from '@/stores/player'
import { ScrollPanel } from 'primevue'
import { formatTime } from '@/stores/player'

const playerStore = usePlayerStore()
</script>

<template>
  <ScrollPanel
    class="w-full overflow-y-hidden"
    style="width: 100%"
    :dt="{
      bar: {
        background: '{primary.color}',
      },
    }"
  >
    <div class="flex flex-col w-full">
      <div v-for="(item, index) in playerStore.queue" :key="index">
        <div class="grid grid-cols-7 items-center gap-4 w-full p-4 hover:bg-gray-950">
          <div class="relative col-span-1">
            <img class="rounded" :src="getAlbumArtwork(item.artwork, 90)" :alt="item.name" />
          </div>
          <p class="text-sm truncate col-span-3">
            {{ item.name }}
          </p>
          <div class="text-xs truncate max-w-44 col-span-2">{{ item.artist }}</div>
          <div class="text-xs">
            {{ formatTime(item.durationInSeconds) }}
          </div>
        </div>
      </div>
    </div>
  </ScrollPanel>
</template>
