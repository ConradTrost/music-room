import { defineStore } from 'pinia'
import { useAppStore } from './app'

interface State {
  activeMusicId: string | null
  duration: string
  progress: string
  currentTimeSeconds: number
  isPlaying: boolean
  queue: QueueItem[]
  queuePosition: number
}

type Artwork = {
  url: string
  width: number
  height: number
}
type QueueItem = {
  id: string
  discNumber: number
  name: string
  artist: string
  durationInSeconds: number
  albumId: string
  albumName: string
  artwork: Artwork
}

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0')
}

type PlaybackTimeChange = {
  currentPlaybackDuration: number
  currentPlaybackTime: number
  currentPlaybackTimeRemaining: number
}

export const usePlayerStore = defineStore('player', {
  state: (): State => ({
    activeMusicId: null,
    progress: '00:00',
    duration: '00:00',
    currentTimeSeconds: 0,
    isPlaying: false,
    queue: [],
    queuePosition: 0,
  }),

  getters: {
    getActivePlayback: () => {
      const appStore = useAppStore()
      const player = appStore.musicKit.player
      return player.currentPlaybackProgress
    },
    getDurationString: (state) => formatTime(state.queue[state.queuePosition].durationInSeconds),
    getCurrentTimeString: (state) => formatTime(state.currentTimeSeconds),
    getProgress: (state) => {
      return Math.floor(
        (100 * state.currentTimeSeconds) / state.queue[state.queuePosition].durationInSeconds,
      )
    },
    getNowPlaying: (state) => {
      return state.queue[state.queuePosition]
    },
  },
  actions: {
    attachEvents() {
      const appStore = useAppStore()

      appStore.musicKit.addEventListener(
        'queuePositionDidChange',
        (e: { position: number; oldPosition: number }) => {
          this.queuePosition = e.position
        },
      )
      appStore.musicKit.addEventListener('playbackTimeDidChange', (e: PlaybackTimeChange) => {
        if (this.currentTimeSeconds != e.currentPlaybackTime) {
          this.currentTimeSeconds = e.currentPlaybackTime
        }
      })
    },
    pause() {
      const appStore = useAppStore()
      appStore.musicKit.pause()
      this.isPlaying = false
    },
    async play() {
      const appStore = useAppStore()
      appStore.musicKit.play()
      this.isPlaying = true
    },
    async next() {
      const appStore = useAppStore()
      await appStore.musicKit.skipToNextItem()
      this.isPlaying = true
    },
    async prev() {
      const appStore = useAppStore()
      await appStore.musicKit.skipToPreviousItem()
      this.isPlaying = true
    },
    async setQueue(playParams: { kind: string; id: string }) {
      const appStore = useAppStore()
      appStore.musicKit.stop()
      this.activeMusicId = playParams.id
      const queue = await appStore.musicKit.setQueue({ [playParams.kind]: playParams.id })
      this.queue = queue.items.map((item) => ({
        id: item.id,
        discNumber: item.discNumber,
        name: item.title,
        albumId: '',
        albumName: item.albumName,
        artist: item.artistName,
        artwork: item.artwork,
        durationInSeconds: Math.ceil(item.playbackDuration / 1000),
      }))
      await this.play()
    },
  },
})
