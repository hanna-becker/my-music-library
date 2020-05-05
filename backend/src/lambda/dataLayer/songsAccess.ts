import * as AWS from 'aws-sdk'
import { AWSError } from 'aws-sdk'
import { DeleteItemOutput, DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Song } from '../../models/Song'
import * as AWSXRay from 'aws-xray-sdk'


const XAWS = AWSXRay.captureAWS(AWS)

export class SongsAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly songstable = process.env.SONGS_TABLE) {
  }

  async addSong(song: Song): Promise<Song> {
    await this.docClient.put({
      TableName: this.songstable,
      Item: song
    }).promise()

    return song
  }

  async deleteSong(song: Song): Promise<DeleteItemOutput | AWSError> {
    const { userId, trackId } = song
    return this.docClient.delete({
      TableName: this.songstable,
      Key: { userId, trackId }
    }).promise()
  }

  async getSongsByUser(userId: string): Promise<Song[]> {
    const result = await this.docClient.query({
      TableName: this.songstable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    return result.Items as Song[]
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
