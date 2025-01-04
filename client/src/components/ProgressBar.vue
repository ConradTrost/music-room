<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { ref, onMounted } from 'vue'

const visualizer = ref<HTMLCanvasElement | null>(null)
const isAnimationPaused = ref(true)
const isMouseDown = ref(false)

const drawWaveform = (ctx: CanvasRenderingContext2D, waveformData: Float32Array<ArrayBuffer>) => {
  const width = visualizer.value?.width ?? 0
  const height = visualizer.value?.height ?? 0

  ctx.clearRect(0, 0, width, height)

  ctx.beginPath()

  const centerY = height / 2
  const sliceWidth = width / waveformData.length

  let x = 0
  waveformData.forEach((value) => {
    const y = centerY + value * centerY

    if (x === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth
  })

  ctx.stroke()
}

const playerStore = usePlayerStore()

onMounted(() => {
  const ctx = visualizer.value.getContext('2d')

  const wrapperElem = document.getElementById('progress-wrapper') // change
  visualizer.value.width = wrapperElem.clientWidth
  visualizer.value.height = wrapperElem.clientHeight
  const waveformData = new Float32Array(playerStore.audioAnalyser.fftSize)

  const visualization = () => {
    playerStore.audioAnalyser.getFloatTimeDomainData(waveformData)

    const progress = playerStore.getProgress

    const gradient = ctx.createLinearGradient(0, 0, visualizer.value?.width ?? 0, 0)
    gradient.addColorStop(0, '#34d399')
    gradient.addColorStop(progress, '#34d399')
    gradient.addColorStop(progress, '#57534e')
    gradient.addColorStop(1, '#57534e')

    ctx.lineWidth = 6
    ctx.strokeStyle = gradient

    drawWaveform(ctx, waveformData)
    // if (!isAnimationPaused.value) {
    //   drawWaveform(ctx, waveformData)
    // } else {
    //   ctx.stroke()
    // }

    requestAnimationFrame(visualization)
  }

  visualization()
})

const handleMouseUp = async (e) => {
  isMouseDown.value = false
  if (!playerStore.isSeeking) {
    const newProgress = e.offsetX / e.srcElement.offsetWidth
    playerStore.startSeek(newProgress * playerStore.currentDurationSeconds)
  }
  await playerStore.seek()
}
const handleMouseLeave = () => {
  playerStore.stopSeek()
  isMouseDown.value = false
  isAnimationPaused.value = false
}
const seekTo = (e) => {
  if (isMouseDown.value) {
    const newProgress = e.offsetX / e.srcElement.offsetWidth
    playerStore.startSeek(newProgress * playerStore.currentDurationSeconds)
  }
}
</script>

<template>
  <div
    id="progress-wrapper"
    @mousedown="isMouseDown = true"
    @mouseup="handleMouseUp($event)"
    @mousemove="seekTo($event)"
    @mouseleave="handleMouseLeave"
    @mouseover="isAnimationPaused = true"
  >
    <canvas ref="visualizer" id="waveform"></canvas>
  </div>
</template>
