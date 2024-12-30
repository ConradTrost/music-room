export type Artwork = {
  url: string
  width: number
  height: number
}
export type MusicData = {
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
export type Playlist = {
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
// export type AlbumChartApiResponse = {
//   data: {
//     results: {
//       albums: {
//         chart: string
//         name: string
//         orderId: string
//         next: string
//         data: MusicKit.Albums[]
//       }[]
//     }
//   }
// }

export type ChartAlbum = {
  albums: {
    chart: string
    name: string
    orderId: string
    next: string
    data: MusicKit.Albums[]
  }[]
}

export type ChartPlaylist = {
  playlists: {
    chart: string
    name: string
    orderId: string
    next: string
    data: MusicKit.Playlists[]
  }[]
}

export type ChartSong = {
  songs: {
    chart: string
    name: string
    orderId: string
    next: string
    data: MusicKit.Songs[]
  }
}

export type ChartType = ChartPlaylist | ChartAlbum | ChartSong

export type MusicChartApiResponse<T extends ChartType> = {
  data: {
    results: T
  }
}

export type MusicGenresApiResponse = {
  data: { data: MusicKit.Genres[] }
}

export type MusicRecommendations = {
  data: {
    data: MusicKit.PersonalRecommendation[]
  }
}
