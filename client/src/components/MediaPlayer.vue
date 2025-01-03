<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import ProgressBar from 'primevue/progressbar'
import Slider from 'primevue/slider'
import { InputNumber } from 'primevue'
import QueueList from './QueueList.vue'
import { getAlbumArtwork } from '@/stores/music'

const volume = ref(1)
const playbackRate = ref(1)
const visualizer = ref<HTMLCanvasElement | null>(null)
const isHidden = ref(false)

let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let ctx: CanvasRenderingContext2D | null = null

const draw = (frequencyData: Uint8Array) => {
  if (ctx) {
    ctx.clearRect(0, 0, visualizer.value.width, visualizer.value.height)
    const barWidth = visualizer.value.width / frequencyData.length
    frequencyData.forEach((value, index) => {
      const barHeight = (value / 255) * visualizer.value.height
      ctx.fillStyle = 'rgb(0, 0, 0)'
      ctx.fillRect(index * barWidth, visualizer.value.height - barHeight, barWidth, barHeight)
    })
  }
}

const drawWaveform = (waveformData) => {
  if (ctx) {
    ctx.clearRect(0, 0, visualizer.value?.width ?? 0, visualizer.value?.height ?? 0)

    const grad = ctx.createLinearGradient(0, 0, 280, 0)
    grad.addColorStop(0, 'lightblue')
    grad.addColorStop(1, 'darkblue')

    ctx.lineWidth = 10
    ctx.strokeStyle = grad
    ctx.beginPath()

    // Calculate the center of the canvas
    const centerY = (visualizer.value?.height ?? 0) / 2
    const width = visualizer.value?.width ?? 0
    const sliceWidth = width / waveformData.length

    let x = 0
    waveformData.forEach((value) => {
      const y = centerY + value * centerY // Normalize the amplitude to canvas height
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      x += sliceWidth
    })

    ctx.stroke()
  }
}

const drawLogarithmicFrequency = (frequencyData) => {
  if (ctx) {
    ctx.clearRect(0, 0, visualizer.value?.width ?? 0, visualizer.value?.height ?? 0)

    const width = visualizer.value?.width ?? 0
    const height = visualizer.value?.height ?? 0
    const barCount = 512 // Number of bars to draw
    const barWidth = width / barCount

    for (let i = 0; i < barCount; i++) {
      const logIndex = Math.pow(i / barCount, 2) * (frequencyData.length - 1)
      const leftBin = Math.floor(logIndex)
      const rightBin = Math.ceil(logIndex)
      const binFraction = logIndex - leftBin

      // Interpolate between bins for smoother transitions
      const value =
        (1 - binFraction) * frequencyData[leftBin] + binFraction * frequencyData[rightBin]

      const barHeight = (value / 255) * height // Normalize the bar height

      const newValue = value / 4
      ctx.fillStyle = `rgb(${newValue}, ${newValue}, ${newValue})`
      ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight)
    }
  }
}

let lastBeatTime = 0
const beatDebounceTime = 300

const detectBeat = (waveformData) => {
  const rms = Math.sqrt(
    waveformData.reduce((sum, value) => sum + value * value, 0) / waveformData.length,
  )

  const beatThreshold = 0.4
  const currentTime = Date.now()
  if (rms > beatThreshold && currentTime - lastBeatTime > beatDebounceTime) {
    lastBeatTime = currentTime
    return true
  }
  return false
}

const visualize = () => {
  isHidden.value = true
  const audioEl = document.getElementById('apple-music-player') as HTMLAudioElement

  if (!audioEl || !visualizer.value) return

  audioEl.crossOrigin = 'anonymous'

  if (!audioContext) {
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 1024 // Adjust for detail level
    sourceNode = audioContext.createMediaElementSource(audioEl)
    sourceNode.connect(analyser)
    analyser.connect(audioContext.destination)
    ctx = visualizer.value.getContext('2d')
  }

  const frequencyData = new Uint8Array(analyser.frequencyBinCount)
  const updateVisualization = () => {
    analyser?.getByteFrequencyData(frequencyData)
    drawLogarithmicFrequency(frequencyData)

    requestAnimationFrame(updateVisualization)
  }

  const waveformData = new Float32Array(analyser.fftSize)
  const canvas = document.getElementById('beatbox')

  const beatVisualization = () => {
    analyser.getFloatTimeDomainData(waveformData)
    const isBeat = detectBeat(waveformData)

    if (isBeat) {
      canvas.style.transform = 'scale(1.02)'
    } else {
      canvas.style.transform = 'scale(1)'
    }
    requestAnimationFrame(beatVisualization)
  }

  beatVisualization()

  updateVisualization()
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
  playerStore.attachEvents()
  setTimeout(() => visualize(), 200)
})

onBeforeUnmount(() => {
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<template>
  <div id="player" class="border-l-2 border-black max-w-sm 2xl:max-w-lg">
    <div class="flex flex-col justify-center items-center">
      <div class="relative image-wrap m-8 mb-4" id="beatbox">
        <canvas
          class="absolute bottom-0 rounded-lg"
          ref="visualizer"
          width="420"
          height="40"
        ></canvas>
        <img
          class="rounded-lg"
          v-on:click="visualize"
          :src="getAlbumArtwork(playerStore.getNowPlaying.artwork, 420)"
        />
      </div>
      <h3>{{ playerStore.getNowPlaying.name }}</h3>
      <h4>{{ playerStore.getNowPlaying.artist }}</h4>
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
      <div class="advanced-controls pb-6">
        <div class="grid grid-cols-7 items-center justify-items-center">
          <font-awesome-icon icon="fa fa-volume-high" style="color: #ebebeba3" />
          <Slider class="col-span-4" v-model="volume" :step="0.01" :max="1" :min="0" />
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
  /* position: fixed; */
  /* width: 30vw; */
  /* min-width: 20vw; */
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  /* padding: 2rem; */
}
/* img {
  border-radius: 1rem;
} */
h3 {
  font-weight: 600;
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
