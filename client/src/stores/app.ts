import { defineStore } from 'pinia'

interface State {
  token: string
  tokenExpiresAt: number
  musicKit: MusicKit.MusicKitInstance
  isUserAuthorized: boolean
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    token: '',
    tokenExpiresAt: 0,
    musicKit: null,
    isUserAuthorized: false,
  }),

  getters: {
    isTokenExpired: (state) => state.tokenExpiresAt < Date.now() / 1000,
    isMusicKitLoaded: (state) => !!state.musicKit,
  },
  actions: {
    async loadTokenFromLocalStorage() {
      this.token = localStorage.getItem('developerToken') || ''
      const expiresAtStr = localStorage.getItem('developerTokenExpiresAt') || '0'
      this.tokenExpiresAt = parseInt(expiresAtStr)
      if (!this.isTokenExpired) return
      const data = await fetch(import.meta.env.VITE_DEVELOPER_TOKEN_URL)
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
        this.isUserAuthorized = this.musicKit.isAuthorized || false
        console.log('isUserAuthorized:', this.isUserAuthorized)
      } catch (err) {
        console.error('MusicKit configuration failed:', err)
      }
    },
    async loginUser() {
      await this.musicKit.authorize()
      this.isUserAuthorized = true
    },
    async logoutUser() {
      await this.musicKit.unauthorize()
      this.isUserAuthorized = false
    },
    async loadMusicKit() {
      await this.loadTokenFromLocalStorage()
      return new Promise<void>((resolve) => {
        document.addEventListener('musickitloaded', async () => {
          await this._configureMusicKit()
          resolve()
        })
        // Fallback if musickitloaded event is missed
        const checkMusicKitLoaded = setInterval(async () => {
          if (window.MusicKit) {
            clearInterval(checkMusicKitLoaded)
            if (!this.isMusicKitLoaded) {
              await this._configureMusicKit()
              resolve()
            }
          }
        }, 100)
      })
    },
  },
})
