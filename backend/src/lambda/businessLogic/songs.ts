import { SongsAccess } from '../dataLayer/trackItemsAccess'
import { Song } from '../../models/Song'


const songsAccess = new SongsAccess()

export async function addSong(song: Song): Promise<Song> {
  return await songsAccess.addSong(song)
}

export async function getTrackIdsByUser(userId: string): Promise<string[]> {
  const songs: Song[] = await songsAccess.getSongsByUser(userId)
  return songs.map(song => song.trackId)
}
