/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'

interface State {
  token: string
  tokenExpiresAt: number
  musicKit: MusicKit.MusicKitInstance | null
  heavyRotation: HeavyRotationData[]
  playlists: Playlist[]
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
type HeavyRotationData = {
  href: string
  id: string
  type: string
  attributes: {
    artistName: string
    artwork: Artwork
    dateAdded: Date
    genreNames: string[]
    name: string
    playParams: {
      id: string
      kind: string
      isLibrary: boolean
    }
    releaseDate: string
    trackCount: number
  }
}
type Playlist = {
  id: string
  type: string
  href: string
  attributes: {
    name: string
    dataAdded: Date
    artwork: Artwork
    playParams: {
      id: string
      kind: string
      isLibrary: boolean
    }
    hasCatalog: boolean
    canEdit: boolean
    isPublic: boolean
  }
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0')
}

export const useMusicStore = defineStore('music', {
  state: (): State => ({
    token: '',
    tokenExpiresAt: 0,
    musicKit: null,
    heavyRotation: [],
    playlists: [],
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
    isTokenExpired: (state) => state.tokenExpiresAt < Date.now() / 1000,
    isMusicKitLoaded: (state) => !!state.musicKit,
    getActivePlayback: (state) => {
      const player = state.musicKit!.player
      return player.currentPlaybackProgress
    },
    isUserAuthorized: (state) => state.musicKit?.isAuthorized || false,
  },
  actions: {
    async loadTokenFromLocalStorage() {
      this.token = localStorage.getItem('developerToken') || ''
      const expiresAtStr = localStorage.getItem('developerTokenExpiresAt') || '0'
      this.tokenExpiresAt = parseInt(expiresAtStr)
      if (!this.isTokenExpired) return
      const data = await fetch('http://localhost:8080/token')
      const { token, expiresAt } = (await data.json()) as { token: string; expiresAt: number }

      localStorage.setItem('developerToken', token)
      localStorage.setItem('developerTokenExpiresAt', expiresAt.toString())

      this.token = token
      this.tokenExpiresAt = expiresAt
    },
    async _configureMusicKit() {
      try {
        console.log('Configuring MusicKit...')
        await MusicKit.configure({
          developerToken: this.token,
          app: {
            name: 'Trost Dev Apple Music API',
            build: '0.0.1',
          },
        })
        this.musicKit = window.MusicKit.getInstance()
      } catch (err) {
        console.error('MusicKit configuration failed:', err)
      }
    },
    attachEvents() {
      const waitForMediaPlayer = setInterval(() => {
        const audioEl = document.getElementById('apple-music-player') as any
        if (audioEl) {
          clearInterval(waitForMediaPlayer)
          this.musicKit!.addEventListener('playbackStateDidChange', (e: any) => {
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
      console.log('pausing')
      this.musicKit!.pause()
      this.isPlaying = false
    },
    async play() {
      console.log('playing')
      this.musicKit!.play()
      this.isPlaying = true
    },
    async next() {
      await this.musicKit!.skipToNextItem()
      this.isPlaying = true
    },
    async prev() {
      await this.musicKit!.skipToPreviousItem()
      this.isPlaying = true
    },
    async loadMusicKit() {
      await this.loadTokenFromLocalStorage()
      return new Promise<void>((resolve) => {
        document.addEventListener('musickitloaded', async () => {
          console.log('musickitloaded event heard.')
          await this._configureMusicKit()
          this.attachEvents()
          resolve()
        })
        // Fallback if musickitloaded is missed
        const checkMusicKitLoaded = setInterval(async () => {
          if (window.MusicKit) {
            clearInterval(checkMusicKitLoaded)
            if (!this.isMusicKitLoaded) {
              await this._configureMusicKit()
              this.attachEvents()
              resolve()
            }
          }
        }, 100)
      })
    },
    // async authorizeUser() {
    //   if (!this.isMusicKitLoaded) return
    //   await this.musicKit!.authorize().catch((err) => {
    //     console.log(err)
    //   })

    //   console.log('is authorized: ', this.musicKit!.isAuthorized)
    // },
    async getAlbums() {
      if (!this.isMusicKitLoaded) return
      const res = await this.musicKit!.api.music('v1/me/library/albums')
      console.log(res)
    },
    async getPlaylists() {
      const { data } = (await this.musicKit!.api.music(
        'v1/me/library/playlists?extend=artwork',
      )) as any
      // const playlists = await Promise.all(
      //   data.data.map(async (playlist) => {
      //     const morePlaylistData = (await this.musicKit!.api.music(
      //       `v1/me/library/playlists/${playlist.id}`,
      //     )) as any

      //     return {
      //       ...playlist,
      //       attributes: {
      //         ...playlist.attributes,
      //         artwork: morePlaylistData.attributes.artwork,
      //       },
      //     }
      //   }),
      // )
      console.log('playlists', data.data)
      this.playlists.push(...data.data)
    },
    async getHeavyRotation() {
      const { data } = (await this.musicKit!.api.music('v1/me/history/heavy-rotation')) as {
        data: { data: HeavyRotationData[] }
      }
      this.heavyRotation.push(...data.data)
    },
    getAlbumArtwork(artwork: Artwork, size: number) {
      return artwork.url.replace(/\{[wh]\}/g, size.toString())
    },
    async playMusic(playParams: MusicKit.PlayParameters) {
      this.musicKit!.stop()
      console.log('playing', playParams.kind, playParams.id)
      this.activeMusicId = playParams.id
      await this.musicKit!.setQueue({ [playParams.kind]: playParams.id })
      await this.play()
    },
  },
})
