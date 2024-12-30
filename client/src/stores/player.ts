/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { useAppStore } from './app'

interface State {
  activeMusicId: string | null
  nowPlaying: NowPlaying
  duration: string
  progress: string
  isPlaying: boolean
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

const formatTime = (seconds: number): string => {
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
    isPlaying: false,
  }),

  getters: {
    getActivePlayback: () => {
      const appStore = useAppStore()
      const player = appStore.musicKit!.player
      return player.currentPlaybackProgress
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
            this.duration = formatTime(durationInSecs)

            this.nowPlaying = {
              id: mediaItem.id,
              name: mediaItem.attributes.name,
              artist: mediaItem.attributes.artistName,
              artwork: mediaItem.attributes.artwork,
            }
            console.log(this.nowPlaying)
          })
          audioEl.addEventListener('timeupdate', () => {
            this.progress = formatTime(audioEl.currentTime)
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
      await appStore.musicKit!.setQueue({ [playParams.kind]: playParams.id })
      await this.play()
    },
  },
})
