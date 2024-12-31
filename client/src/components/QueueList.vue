<script setup lang="ts">
import { getAlbumArtwork } from '@/stores/music'
import { usePlayerStore } from '@/stores/player'
import { DataView } from 'primevue'
import { formatTime } from '@/stores/player'

const playerStore = usePlayerStore()
</script>

<template>
  <DataView class="w-full overflow-y-auto" :value="playerStore.queue">
    <template #list="slotProps">
      <div class="flex flex-col w-full">
        <div v-for="(item, index) in slotProps.items" :key="index">
          <div class="flex flex-row items-center p-2 gap-4 w-full px-6">
            <div class="w-10 relative">
              <img class="rounded" :src="getAlbumArtwork(item.artwork, 90)" :alt="item.name" />
            </div>
            <div class="flex flex-row justify-between items-center flex-1 gap-2">
              <div class="text-sm mt-2 truncate max-w-44">{{ item.name }}</div>
            </div>
            <div class="flex items-center gap-8 px-4">
              <div class="text-xs mt-2 truncate max-w-44">{{ item.artist }}</div>
              <div class="text-xs mt-2 truncate">
                {{ formatTime(item.durationInSeconds) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DataView>
</template>
