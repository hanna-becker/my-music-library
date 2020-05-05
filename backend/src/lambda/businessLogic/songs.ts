import { Song } from '../../models/Song'
import { SongsAccess } from '../dataLayer/songsAccess'
import { SearchResult } from '../../models/SearchResult'
import { SpotifyApiAccess } from '../dataLayer/spotifyApiAccess'

const songsAccess = new SongsAccess()
const spotifyApiAccess = new SpotifyApiAccess()

export async function addSong(song: Song): Promise<Song> {
  return await songsAccess.addSong(song)
}

export async function getTrackIdsByUser(userId: string): Promise<string[]> {
  const songs: Song[] = await songsAccess.getSongsByUser(userId)
  return songs.map(song => song.trackId)
}

export async function deleteSong(song: Song) {
  return songsAccess.deleteSong(song)
}

export async function searchSong(searchTerm: string): Promise<SearchResult[]> {
  const tracks = await spotifyApiAccess.searchSong(searchTerm)

  return tracks.map((track) => {
    const { id, name, artists, duration_ms, album: { images } } = track
    const duration = formatSongDuration(duration_ms)
    const artistsNames = formatArtists(artists)
    const imageUrl = retrieveSmallestImageUrl(images)
    return { id, name, artists: artistsNames, duration, imageUrl }
  })
}

const retrieveSmallestImageUrl = (images): string => {
  let sortedImages = []
  if (images) {
    sortedImages = images.slice().sort((image1, image2) => {
      return image1.height - image2.height
    })
  }
  if (sortedImages.length) {
    const smallestImage = sortedImages[0]
    return smallestImage.url
  }
  return ''
}

const formatArtists = (artists: SpotifyApi.ArtistObjectSimplified[]) => {
  const artistsList = artists.map((artist) => artist.name)
  return artistsList.join(', ')
}

const formatSongDuration = (durationMs: number): string => {
  const seconds = Math.round(durationMs / 1000)

  const displaySeconds = seconds % 60
  const totalMinutes = (seconds - displaySeconds) / 60
  const displayMinutes = totalMinutes % 60
  const displayHours = (totalMinutes - displayMinutes) / 60

  const displaySecondsString = (displaySeconds < 10) ? '0' + displaySeconds : displaySeconds

  if (displayHours > 0) {
    const displayMinutesString = (displayMinutes < 10) ? '0' + displayMinutes : displayMinutes
    return displayHours + ':' + displayMinutesString + ':' + displaySecondsString + ' h'
  }

  return displayMinutes + ':' + displaySecondsString + ' min'
}

