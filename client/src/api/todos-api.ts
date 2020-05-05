import { apiEndpoint } from '../config'
import { Todo } from '../types/Todo'
import { CreateTodoRequest } from '../types/CreateTodoRequest'
import Axios from 'axios'
import { SearchResult } from '../types/SearchResult'

export async function getTodos(idToken: string): Promise<Todo[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  console.log('Todos:', response.data)
  return response.data.items
}

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

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  const response = await Axios.post(`${apiEndpoint}/todos`, JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
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

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
