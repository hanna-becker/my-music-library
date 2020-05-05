import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { Song } from '../../models/Song'
import { addSong } from '../businessLogic/songs'

const logger = createLogger('addSong')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('event: ', event)

  const userId = getUserId(event)
  const { trackId } = JSON.parse(event.body)

  try {
    const song: Song = await addSong({ userId, trackId })
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: song
      })
    }
  } catch (err) {
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
