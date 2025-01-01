import { defineStore } from 'pinia'

interface State {
  token: string
  tokenExpiresAt: number
  musicKit: MusicKit.MusicKitInstance | null
  isLoaded: boolean
  isUserAuthorized: boolean
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    token: '',
    tokenExpiresAt: 0,
    musicKit: null,
    isLoaded: false,
    isUserAuthorized: false,
  }),

  getters: {
    isTokenExpired: (state) => state.tokenExpiresAt < Date.now() / 1000,
    isMusicKitLoaded: (state) => !!state.musicKit,
    // isUserAuthorized: (state) => state.musicKit?.isAuthorized || false,
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
    async loginUser() {
      await this.musicKit?.authorize()
      this.isUserAuthorized = true
    },
    async logoutUser() {
      await this.musicKit?.unauthorize()
      this.isUserAuthorized = false
    },
    async loadMusicKit() {
      await this.loadTokenFromLocalStorage()
      return new Promise<void>((resolve) => {
        document.addEventListener('musickitloaded', async () => {
          console.log('musickitloaded event heard.')
          await this._configureMusicKit()
          this.isLoaded = true
          this.isUserAuthorized = this.musicKit?.isAuthorized || false
          // this.attachEvents()
          resolve()
        })
        // Fallback if musickitloaded is missed
        const checkMusicKitLoaded = setInterval(async () => {
          if (window.MusicKit) {
            clearInterval(checkMusicKitLoaded)
            if (!this.isMusicKitLoaded) {
              await this._configureMusicKit()
              this.isLoaded = true
              this.isUserAuthorized = this.musicKit?.isAuthorized || false
              // this.attachEvents()
              resolve()
            }
          }
        }, 100)
      })
    },
  },
})
