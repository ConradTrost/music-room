<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { getAlbumArtwork } from '@/stores/music'
import { usePlayerStore } from '@/stores/player'
import ProgressBar from 'primevue/progressbar'
import Slider from 'primevue/slider'
import { InputText } from 'primevue'
import { ref, watch } from 'vue'
import QueueList from './QueueList.vue'

const playerStore = usePlayerStore()

const volume = ref(1)
const playbackRate = ref(1)

watch(playbackRate, () => {
  const audioEl = document.getElementById('apple-music-player') as any
  audioEl.playbackRate = playbackRate.value
})
watch(volume, () => {
  const audioEl = document.getElementById('apple-music-player') as any
  audioEl.volume = volume.value
})
</script>

<template>
  <div id="player" class="border-l-2 border-primary" v-if="playerStore.nowPlaying.id">
    <div class="flex flex-col justify-center items-center p-8">
      <div class="image-wrap">
        <img :src="getAlbumArtwork(playerStore.nowPlaying.artwork, 420)" />
      </div>
      <h3>{{ playerStore.nowPlaying.name }}</h3>
      <h4>{{ playerStore.nowPlaying.artist }}</h4>
      <p>{{ playerStore.getCurrentTimeString }} / {{ playerStore.getDurationString }}</p>
      <div class="progress-wrapper">
        <ProgressBar :showValue="false" :value="playerStore.getProgress" />
      </div>

      <div class="controls">
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
      <div class="advanced-controls">
        <Slider v-model="volume" :step="0.01" :max="1" :min="0" />
        <div class="playback-rate-slider flex justify-center items-center">
          <InputText class="w-12 mr-4" v-model.number="playbackRate" />
          <Slider v-model="playbackRate" :step="0.05" :max="2" :min="0.3" />
          <font-awesome-icon
            class="fa-icon fa-undo"
            v-on:click="playbackRate = 1"
            icon="fa fa-rotate-left"
            style="color: #ebebeba3"
          />
        </div>
      </div>
    </div>
    <QueueList />
  </div>
</template>

<style scoped>
#player {
  /* position: fixed; */
  /* width: 30vw; */
  min-width: 20vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  /* padding: 2rem; */
}
img {
  border-radius: 1rem;
}
h3 {
  font-weight: 600;
  margin-top: 1rem;
}
h4 {
  padding-bottom: 0.5rem;
  color: #ebebeba3;
}
.progress-wrapper {
  padding-top: 0.5rem;
  width: 80%;
}
.controls {
  padding-top: 1rem;
  width: 30%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.advanced-controls {
  margin-top: 2rem;
  width: 90%;
}
/* .playback-rate-slider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
} */
.fa-icon {
  height: 1.2rem;
  width: 1.2rem;
}
.fa-undo {
  padding-left: 1.5rem;
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
