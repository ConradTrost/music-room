import { defineStore } from 'pinia'
import axios from 'axios'
import { useAppStore } from './app'
import type {
  MusicData,
  Playlist,
  Artwork,
  ChartPlaylist,
  MusicChartApiResponse,
  ChartAlbum,
  ChartSong,
  MusicGenresApiResponse,
  MusicRecommendations,
} from './music.model'

interface State {
  heavyRotation: MusicData[]
  recentlyAdded: MusicData[]
  playlists: Playlist[]
  chartAlbums: MusicKit.Albums[]
  chartPlaylists: MusicKit.Playlists[]
  chartSongs: MusicKit.Songs[]
  genres: MusicKit.Genres[]
  recommendations: MusicKit.PersonalRecommendation[]
}

// todo move to util
export const getAlbumArtwork = (artwork: Artwork, size: number) => {
  if (!artwork || !artwork.url) return ''
  return artwork.url.replace(/\{[wh]\}/g, size.toString())
}

export const useMusicStore = defineStore('music', {
  state: (): State => ({
    heavyRotation: [],
    recentlyAdded: [],
    playlists: [],
    chartAlbums: [],
    chartPlaylists: [],
    chartSongs: [],
    genres: [],
    recommendations: [],
  }),

  getters: {
    getChartAlbums: (state) => {
      return state.chartAlbums.map((content) => ({
        id: content.id,
        title: content.attributes.name,
        artist: content.attributes.artistName,
        imageUrl: getAlbumArtwork(content.attributes.artwork, 320),
        kind: 'album',
      }))
    },
    getChartSongs: (state) => {
      return state.chartSongs.map((content) => ({
        id: content.id,
        title: content.attributes.name,
        artist: content.attributes.artistName,
        imageUrl: getAlbumArtwork(content.attributes.artwork, 320),
        kind: 'song',
      }))
    },
    getChartPlaylists: (state) => {
      return state.chartPlaylists.map((content) => ({
        id: content.id,
        title: content.attributes.name,
        artist: content.attributes.curatorName,
        imageUrl: getAlbumArtwork(content.attributes.artwork, 320),
        kind: 'playlist',
      }))
    },
    getHeavyRotation: (state) => {
      return state.heavyRotation.map((content) => ({
        id: content.id,
        title: content.attributes.name,
        artist: content.attributes.artistName,
        imageUrl: getAlbumArtwork(content.attributes.artwork, 320),
        kind: 'album',
      }))
    },
    getRecentlyAdded: (state) => {
      return state.recentlyAdded.map((content) => ({
        id: content.id,
        title: content.attributes.name,
        artist: content.attributes.artistName,
        imageUrl: getAlbumArtwork(content.attributes.artwork, 320),
        kind: 'album',
      }))
    },
    getGenres: (state) => state.genres,
    getRecommendations: (state) => {
      return state.recommendations.map((content) => ({
        id: content.id,
        title: content.attributes.title.stringForDisplay,
        relationships: (
          content.relationships.contents as unknown as MusicKit.Relationship<MusicKit.Resource>
        ).data.map((rel) => ({
          id: rel.id,
          title: rel.attributes.name,
          artist: rel.attributes.artistName,
          imageUrl: getAlbumArtwork(rel.attributes.artwork, 320),
          kind: rel.type,
        })),
      }))
    },
  },
  actions: {
    async loadRecommended() {
      const appStore = useAppStore()
      const { data } = (await appStore.musicKit.api.music(
        `v1/me/recommendations`,
      )) as MusicRecommendations
      this.recommendations = data.data
    },
    async loadChartAlbums(genreId?: number) {
      const appStore = useAppStore()
      const genreFilter = genreId ? `&genre=${genreId}` : ''
      const res = (await appStore.musicKit.api.music(
        `v1/catalog/us/charts?types=albums${genreFilter}`,
      )) as MusicChartApiResponse<ChartAlbum>
      this.chartAlbums = res.data.results.albums[0].data
    },
    async loadChartSongs(genreId?: number) {
      const appStore = useAppStore()
      const genreFilter = genreId ? `&genre=${genreId}` : ''
      const res = (await appStore.musicKit.api.music(
        `v1/catalog/us/charts?types=songs${genreFilter}`,
      )) as MusicChartApiResponse<ChartSong>
      this.chartSongs = res.data.results.songs[0].data
    },
    async loadChartPlaylists() {
      const appStore = useAppStore()
      const res = (await appStore.musicKit.api.music(
        `v1/catalog/us/charts?types=playlists`,
      )) as MusicChartApiResponse<ChartPlaylist>
      this.chartPlaylists = res.data.results.playlists[0].data
    },
    async loadRecentlyAdded() {
      const appStore = useAppStore()
      const { data } = (await appStore.musicKit.api.music('v1/me/library/recently-added')) as {
        data: { data: MusicData[] }
      }
      this.recentlyAdded.push(...data.data)
    },
    async loadHeavyRotation() {
      const appStore = useAppStore()
      const { data } = (await appStore.musicKit.api.music('v1/me/history/heavy-rotation')) as {
        data: { data: MusicData[] }
      }
      this.heavyRotation.push(...data.data)
    },
    async loadGenres() {
      const appStore = useAppStore()
      const { data } = (await appStore.musicKit.api.music(
        'v1/catalog/us/genres',
      )) as MusicGenresApiResponse
      this.genres = data.data
    },
    async addToLibrary(id: string, type: 'song' | 'album' | 'playlist') {
      console.log(id)
      // issues with the music kit post request, therefore directly hitting the api
      const res = await axios.post(
        `https://api.music.apple.com/v1/me/library?ids[${type}s]=${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('developerToken')}`,
            'Music-User-Token': localStorage.getItem('music.rkla4zml44.media-user-token'),
          },
        },
      )
      console.log(res)
    },
  },
})
