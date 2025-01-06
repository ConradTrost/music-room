import { defineStore } from 'pinia'
import { useAppStore } from './app'

interface State {
  activeMusicId: string | null
  isSeeking: boolean
  currentSeekTimeSeconds: number
  currentTimeSeconds: number
  currentDurationSeconds: number
  volume: number
  playbackRate: number
  isPlaying: boolean
  queue: QueueItem[]
  queuePosition: number
  audioSourceNode: MediaElementAudioSourceNode
  audioContext: AudioContext
  audioNodeLoaded: boolean
  audioAnalyser: AnalyserNode
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
    isSeeking: false,
    currentSeekTimeSeconds: 0,
    currentTimeSeconds: 0,
    currentDurationSeconds: 0,
    volume: 1,
    playbackRate: 1,
    isPlaying: false,
    queue: [],
    queuePosition: 0,
    audioSourceNode: null,
    audioContext: null,
    audioAnalyser: null,
    audioNodeLoaded: false,
  }),

  getters: {
    getActivePlayback: () => {
      const appStore = useAppStore()
      const player = appStore.musicKit.player
      return player.currentPlaybackProgress
    },
    getDurationString: (state) => formatTime(state.queue[state.queuePosition].durationInSeconds),
    getCurrentSeekTimeString: (state) => formatTime(state.currentSeekTimeSeconds),
    getCurrentTimeString: (state) => formatTime(state.currentTimeSeconds),
    getProgress: (state) => {
      let currTime = state.currentTimeSeconds
      if (state.isSeeking) {
        currTime = state.currentSeekTimeSeconds
      }

      const progress =
        Math.round((100 * currTime) / state.queue[state.queuePosition].durationInSeconds) / 100

      return Math.max(Math.min(progress, 1), 0)
    },
    getNowPlaying: (state) => {
      return state.queue[state.queuePosition]
    },
  },
  actions: {
    attachEvents() {
      const appStore = useAppStore()

      const volumeSetting = localStorage.getItem('volume')
      if (volumeSetting) {
        this.volume = parseFloat(volumeSetting)
      }

      appStore.musicKit.addEventListener('mediaCanPlay', (e: { srcElement: HTMLAudioElement }) => {
        // when changing songs, apple overrides the volume.
        // this sets the volume back to the state value
        console.log('mediaCanPlay', e)
        e.srcElement.volume = this.volume
        e.srcElement.playbackRate = this.playbackRate
      })
      appStore.musicKit.addEventListener('nowPlayingItemDidChange' as keyof MusicKit.Events, () => {
        // when changing songs, apple overrides the volume.
        // this sets the volume back to the state value
        this.setVolume(this.volume)
        this.setPlaybackRate(this.playbackRate)
      })

      appStore.musicKit.addEventListener('mediaElementCreated' as keyof MusicKit.Events, () => {
        if (!this.audioSourceNode) {
          this.setupAudioContext()
        }
      })

      appStore.musicKit.addEventListener(
        'queuePositionDidChange',
        (e: { position: number; oldPosition: number }) => {
          console.log('queue pos changeS')
          this.setVolume(this.volume)
          this.queuePosition = e.position
          this.currentDurationSeconds = this.queue[e.position].durationInSeconds
        },
      )
      appStore.musicKit.addEventListener('playbackTimeDidChange', (e: PlaybackTimeChange) => {
        if (this.currentTimeSeconds != e.currentPlaybackTime) {
          this.currentTimeSeconds = e.currentPlaybackTime
        }
      })
    },
    setupAudioContext() {
      const audioEl = document.getElementById('apple-music-player') as HTMLAudioElement
      audioEl.crossOrigin = 'anonymous'
      this.audioContext = new AudioContext()
      this.audioSourceNode = this.audioContext.createMediaElementSource(audioEl)
      this.audioAnalyser = this.audioContext.createAnalyser()
      this.audioAnalyser.fftSize = 512
      this.audioSourceNode.connect(this.audioAnalyser)
      this.audioAnalyser.connect(this.audioContext.destination)
      this.audioNodeLoaded = true
    },
    startSeek(timeInSeconds: number) {
      this.isSeeking = true
      this.currentSeekTimeSeconds = timeInSeconds
    },
    stopSeek() {
      this.isSeeking = false
      this.currentSeekTimeSeconds = 0
    },
    async seek() {
      const appStore = useAppStore()
      await appStore.musicKit.seekToTime(this.currentSeekTimeSeconds)
      this.stopSeek()
    },
    setVolume(volume: number) {
      const audioEl = document.getElementById('apple-music-player') as HTMLAudioElement
      if (audioEl) {
        audioEl.volume = volume
      }
      this.volume = volume
      localStorage.setItem('volume', volume.toString())
    },
    setPlaybackRate(playbackRate: number) {
      const audioEl = document.getElementById('apple-music-player') as HTMLAudioElement
      if (audioEl) {
        audioEl.playbackRate = playbackRate
      }
      this.playbackRate = playbackRate
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
