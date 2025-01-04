<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Slider from 'primevue/slider'
import { InputNumber } from 'primevue'
import QueueList from './QueueList.vue'
import ProgressBar from './ProgressBar.vue'
import { getAlbumArtwork } from '@/stores/music'

const volume = ref(1)
const playbackRate = ref(1)
const visualizer = ref<HTMLCanvasElement | null>(null)
const isHidden = ref(false)

let ctx: CanvasRenderingContext2D | null = null

const drawLogarithmicFrequency = (frequencyData) => {
  const width = visualizer.value?.width ?? 0
  const height = visualizer.value?.height ?? 0

  ctx.clearRect(0, 0, width, height)

  const barCount = 256
  const barWidth = width / barCount

  for (let i = 0; i < barCount; i++) {
    const logIndex = Math.pow(i / barCount, 2) * (frequencyData.length - 1)
    const leftBin = Math.floor(logIndex)
    const rightBin = Math.ceil(logIndex)
    const binFraction = logIndex - leftBin

    // Interpolate between bins for smoother transitions
    const value = (1 - binFraction) * frequencyData[leftBin] + binFraction * frequencyData[rightBin]

    const barHeight = (value / 255) * height // Normalize the bar height

    const colorValue = value / 4
    ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`
    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight)
  }
}

watch(playbackRate, (newRate) => {
  const audioEl = document.getElementById('apple-music-player') as HTMLAudioElement
  audioEl.playbackRate = newRate
})

watch(volume, (newVolume) => {
  const audioEl = document.getElementById('apple-music-player') as HTMLAudioElement
  audioEl.volume = newVolume
})

const playerStore = usePlayerStore()

onMounted(() => {
  isHidden.value = true
  ctx = visualizer.value.getContext('2d')

  // subtracting 40 due to missing high end frequencies
  const frequencyData = new Uint8Array(playerStore.audioAnalyser.frequencyBinCount - 40) // 256

  const albumImg = document.getElementById('album-cover')
  console.log(visualizer.value)
  const updateVisualization = () => {
    if (visualizer.value) {
      if (!visualizer.value.width || !visualizer.value.height) {
        visualizer.value.width = albumImg.clientWidth
        visualizer.value.height = albumImg.clientHeight / 9
      }
      playerStore.audioAnalyser?.getByteFrequencyData(frequencyData) // values between 0 and 255

      drawLogarithmicFrequency(frequencyData)
    }

    requestAnimationFrame(updateVisualization)
  }

  updateVisualization()
})

onBeforeUnmount(() => {
  if (playerStore.audioContext.state !== 'closed') {
    playerStore.audioContext.close()
  }
})
</script>

<template>
  <div id="player" class="border-l-2 border-black max-w-sm 2xl:max-w-lg">
    <div class="flex flex-col justify-center items-center">
      <div class="relative image-wrap m-8 mb-4 overflow-hidden" id="beatbox">
        <canvas
          class="absolute bottom-0 rounded-lg"
          ref="visualizer"
          width="420"
          height="40"
        ></canvas>
        <img
          id="album-cover"
          class="rounded-lg"
          :src="getAlbumArtwork(playerStore.getNowPlaying.artwork, 420)"
        />
      </div>
      <h3>{{ playerStore.getNowPlaying.name }}</h3>
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
