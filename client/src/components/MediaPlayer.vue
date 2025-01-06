<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { ref, computed } from 'vue'
import Slider from 'primevue/slider'

import { InputNumber, Button, Menu, useToast } from 'primevue'
import QueueList from './QueueList.vue'
import ProgressBar from './ProgressBar.vue'
import { useMusicStore } from '@/stores/music'
import AlbumImgWithFrequency from './AlbumImgWithFrequency.vue'

const playerStore = usePlayerStore()
const musicStore = useMusicStore()

const volume = computed({
  get: () => playerStore.volume,
  set: (volume) => playerStore.setVolume(volume),
})
const playbackRate = computed({
  get: () => playerStore.playbackRate,
  set: (playbackRate) => playerStore.setPlaybackRate(playbackRate),
})

const menu = ref()
const toast = useToast()
const items = ref([
  {
    label: 'Add to library',
    icon: 'fa fa-plus',
    command: async () => {
      console.log('hi')
      const id = playerStore.getNowPlaying.id
      await musicStore.addToLibrary(id, 'song')
      toast.add({
        severity: 'secondary',
        summary: 'Success',
        detail: 'Song added to library',
        life: 5000,
      })
    },
  },
])
const toggle = (event) => {
  menu.value.toggle(event)
}
</script>

<template>
  <div id="player" class="border-l-2 border-surface-600 max-w-sm 2xl:max-w-lg">
    <div class="flex flex-col justify-center items-center">
      <AlbumImgWithFrequency />
      <div class="grid grid-cols-6 items-center gap-1">
        <div class="col-span-1"></div>
        <h3 class="col-span-4">
          {{ playerStore.getNowPlaying.name }}
        </h3>
        <Button @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
          <font-awesome-icon
            class="col-span-1"
            icon="fa fa-ellipsis-vertical"
            style="color: #ebebeba3"
          />
        </Button>
        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
          <template #item="{ item, props }">
            <div v-bind="props.action" :target="item.target">
              <font-awesome-icon :icon="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
            </div>
          </template>
        </Menu>
      </div>
      <h4>{{ playerStore.getNowPlaying.artist }}</h4>
      <p>
        {{
          playerStore.isSeeking
            ? playerStore.getCurrentSeekTimeString
            : playerStore.getCurrentTimeString
        }}
        / {{ playerStore.getDurationString }}
      </p>
      <ProgressBar v-if="playerStore.audioNodeLoaded" class="h-16 w-9/12" />

      <div class="w-3/12 flex items-center justify-between">
        <font-awesome-icon
          class="fa-icon"
          icon="fa fa-backward"
          v-on:click="playerStore.prev"
          style="color: #ebebeba3"
        />
        <font-awesome-icon
          class="fa-icon fa-icon-center"
          v-if="playerStore.isPlaying"
          v-on:click="playerStore.pause"
          icon="fa fa-stop"
          style="color: #ebebeba3"
        />
        <font-awesome-icon
          class="fa-icon fa-icon-center"
          v-if="!playerStore.isPlaying"
          v-on:click="playerStore.play"
          icon="fa fa-play"
          style="color: #ebebeba3"
        />
        <font-awesome-icon
          class="fa-icon"
          v-on:click="playerStore.next"
          icon="fa fa-forward"
          style="color: #ebebeba3"
        />
      </div>
      <div class="advanced-controls pb-6">
        <div class="grid grid-cols-7 items-center justify-items-center">
          <font-awesome-icon icon="fa fa-volume-high" style="color: #ebebeba3" />
          <Slider
            id="volume-slider"
            class="col-span-4"
            v-model="volume"
            :step="0.01"
            :max="1"
            :min="0"
          />
          <span class="col-span-2"></span>
          <font-awesome-icon icon="fa fa-gauge-high" style="color: #ebebeba3" />
          <Slider class="col-span-4" v-model="playbackRate" :step="0.05" :max="2" :min="0.3" />
          <font-awesome-icon
            class="hover:scale-105 hover:cursor-pointer"
            v-on:click="playbackRate = 1"
            icon="fa fa-rotate-left"
            style="color: #ebebeba3"
          />
          <InputNumber
            class="col-span-1 px-2"
            :maxFractionDigits="2"
            v-model="playbackRate"
            fluid
          />
        </div>
      </div>
    </div>
    <QueueList />
  </div>
</template>

<style scoped>
#player {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
}
h3 {
  font-weight: 600;
}
h4 {
  padding-bottom: 0.5rem;
  color: #ebebeba3;
}
.advanced-controls {
  margin-top: 2rem;
  width: 90%;
}
.fa-icon {
  height: 1.2rem;
  width: 1.2rem;
}
.fa-icon-center {
  height: 1.5rem;
  width: 1.5rem;
}
.fa-icon:hover {
  cursor: pointer;
  transform: scale(1.08);
  transition: linear 0.1s;
}
</style>
