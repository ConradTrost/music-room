/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { useAppStore } from './app'

interface State {
  activeMusicId: string | null
  nowPlaying: NowPlaying
  duration: string
  progress: string
  currentTimeSeconds: number
  durationSeconds: number
  isPlaying: boolean
  queue: QueueItem[]
}

type NowPlaying = {
  id: string
  name: string
  artist: string
  artwork: Artwork
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

export const usePlayerStore = defineStore('player', {
  state: (): State => ({
    activeMusicId: null,
    nowPlaying: {
      id: '',
      name: '',
      artist: '',
      artwork: {
        url: '',
        width: 0,
        height: 0,
      },
    },
    progress: '00:00',
    duration: '00:00',
    currentTimeSeconds: 0,
    durationSeconds: 0,
    isPlaying: false,
    queue: [],
  }),

  getters: {
    getActivePlayback: () => {
      const appStore = useAppStore()
      const player = appStore.musicKit!.player
      return player.currentPlaybackProgress
    },
    getDurationString: (state) => formatTime(state.durationSeconds),
    getCurrentTimeString: (state) => formatTime(state.currentTimeSeconds),
    getProgress: (state) => {
      return Math.floor((100 * state.currentTimeSeconds) / state.durationSeconds)
    },
  },
  actions: {
    attachEvents() {
      const appStore = useAppStore()

      const waitForMediaPlayer = setInterval(() => {
        const audioEl = document.getElementById('apple-music-player') as any
        if (audioEl) {
          clearInterval(waitForMediaPlayer)
          appStore.musicKit!.addEventListener('playbackStateDidChange', (e: any) => {
            console.log('duration change', e.nowPlayingItem)
            const mediaItem = e.nowPlayingItem
            const durationInSecs = mediaItem.attributes.durationInMillis / 1000

            this.durationSeconds = durationInSecs

            // this.duration = formatTime(durationInSecs)

            this.nowPlaying = {
              id: mediaItem.id,
              name: mediaItem.attributes.name,
              artist: mediaItem.attributes.artistName,
              artwork: mediaItem.attributes.artwork,
            }
            console.log(this.nowPlaying)
          })
          audioEl.addEventListener('timeupdate', () => {
            this.currentTimeSeconds = audioEl.currentTime
            // this.progress = formatTime(audioEl.currentTime)
          })
        }
      }, 100)
    },
    pause() {
      const appStore = useAppStore()
      console.log('pausing')
      appStore.musicKit!.pause()
      this.isPlaying = false
    },
    async play() {
      const appStore = useAppStore()
      console.log('playing')
      appStore.musicKit!.play()
      this.isPlaying = true
    },
    async next() {
      const appStore = useAppStore()
      await appStore.musicKit!.skipToNextItem()
      this.isPlaying = true
    },
    async prev() {
      const appStore = useAppStore()
      await appStore.musicKit!.skipToPreviousItem()
      this.isPlaying = true
    },
    async playMusic(playParams: { kind: string; id: string }) {
      const appStore = useAppStore()
      appStore.musicKit!.stop()
      console.log('playing', playParams.kind, playParams.id)
      this.activeMusicId = playParams.id
      const queue = await appStore.musicKit!.setQueue({ [playParams.kind]: playParams.id })
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
      // appStore.musicKit.changeToMediaAtIndex
      await this.play()
    },
  },
})
