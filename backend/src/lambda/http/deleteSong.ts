import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { deleteSong } from '../businessLogic/songs'


const logger = createLogger('deleteSong')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('event: ', event)

  const trackId: string = event.pathParameters.trackId
  const userId: string = getUserId(event)

  try {
    await deleteSong({ userId, trackId })
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: `Successfully deleted todo item with id ${trackId}`
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
