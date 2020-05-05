import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import SpotifyWebApi from 'spotify-web-api-node'

import * as AWS from 'aws-sdk'
import { SearchResult } from '../../models/SearchResult'
// import * as AWSXRay from 'aws-xray-sdk'
//
// const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('searchSong')

const spotifySecretId = process.env.SPOTIFY_API_CLIENT_SECRET_ID
const spotifySecretField = process.env.SPOTIFY_API_CLIENT_SECRET_FIELD
const spotifyClientId = process.env.SPOTIFY_API_CLIENT_ID

const client = new AWS.SecretsManager()

let cachedSecret

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('event: ', event)

  const secretObj: any = await getSecret()
  const spotifyClientSecret: string = secretObj[spotifySecretField]

  const spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret
  })

  try {
    // TODO: extract function
    const clientCredResponse = await spotifyApi.clientCredentialsGrant()
    spotifyApi.setAccessToken(clientCredResponse.body['access_token'])
    // TODO: cache access token for ~ this much time
    console.log(`The access token expires in ${clientCredResponse.body['expires_in']} seconds`)

    const searchTerm: string = event.queryStringParameters.searchTerm
    const searchResponse = await spotifyApi.searchTracks(searchTerm)
    const searchResults: SpotifyApi.SearchResponse = searchResponse.body
    const tracks = searchResults.tracks.items

    const minimalTracks: SearchResult[] = tracks.map((track) => {
      const { name, artists, duration_ms, uri, album: { images } } = track
      const duration = formatDuration(duration_ms)
      const artistsNames = formatArtists(artists)
      const imageUrl = retrieveSmallestImageUrl(images)
      return { name, artists: artistsNames, duration, uri, imageUrl }
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(minimalTracks)
    }
  } catch (err) {
    console.log('Something went wrong when retrieving an access token', err)
    const statusCode = err.statusCode || 500
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(err)
    }
  }

}

async function getSecret(): Promise<any> {
  if (cachedSecret) {
    return cachedSecret
  }

  const data = await client.getSecretValue({
    SecretId: spotifySecretId
  }).promise()

  cachedSecret = JSON.parse(data.SecretString)

  return cachedSecret
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

const formatArtists = (artists: any[]) => {
  const artistsList = artists.map((artist) => artist.name)
  return artistsList.join(', ')
}

const formatDuration = (durationMs: number): string => {
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
