<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { ref, onMounted, onBeforeUnmount } from 'vue'

import { getAlbumArtwork } from '@/stores/music'

const playerStore = usePlayerStore()

const frequencyVisualizer = ref<HTMLCanvasElement | null>(null)
const isHidden = ref(false)

let ctx: CanvasRenderingContext2D | null = null

const drawLogarithmicFrequency = (frequencyData) => {
  const width = frequencyVisualizer.value?.width ?? 0
  const height = frequencyVisualizer.value?.height ?? 0

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

onMounted(() => {
  isHidden.value = true
  ctx = frequencyVisualizer.value.getContext('2d')

  // subtracting 40 due to missing high end frequencies
  const frequencyData = new Uint8Array(playerStore.audioAnalyser.frequencyBinCount - 40) // 256

  const albumImg = document.getElementById('album-cover')
  console.log(frequencyVisualizer.value)
  const updateVisualization = () => {
    if (frequencyVisualizer.value) {
      frequencyVisualizer.value.width = albumImg.clientWidth
      frequencyVisualizer.value.height = albumImg.clientHeight / 9
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
  <div class="relative image-wrap m-8 mb-4 overflow-hidden" id="beatbox">
    <canvas
      class="absolute bottom-0 rounded-lg"
      ref="frequencyVisualizer"
      width="420"
      height="40"
    ></canvas>
    <img
      id="album-cover"
      class="rounded-lg"
      :src="getAlbumArtwork(playerStore.getNowPlaying.artwork, 420)"
    />
  </div>
</template>
