import { apiEndpoint } from '../config'
import Axios from 'axios'
import { SearchResult } from '../types/SearchResult'

export async function getSongs(idToken: string): Promise<string[]> {
  console.log('Fetching songs')
  const response = await Axios.get(`${apiEndpoint}/songs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.items
}

// TODO: prevent adding the same song twice
export async function addSong(idToken: string, trackId: string): Promise<string> {
  console.log('Adding song')
  const response = await Axios.post(`${apiEndpoint}/songs`, JSON.stringify({ trackId }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function deleteSong(idToken: string, trackId: string): Promise<void> {
  console.log('Deleting song')
  await Axios.delete(`${apiEndpoint}/songs/${trackId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function searchSong(idToken: string, searchTerm: string): Promise<SearchResult[]> {
  console.log('Searching for songs')
  const response = await Axios.get(`${apiEndpoint}/searchSong?searchTerm=${searchTerm}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data
}
