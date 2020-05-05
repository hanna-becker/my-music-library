import SpotifyWebApi from 'spotify-web-api-node'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('SpotifyApiAccess')

export class SpotifyApiAccess {

  private timestampRetrieveAccessToken
  private cachedSecret
  private spotifyApi: SpotifyWebApi

  constructor(
    private readonly spotifySecretId = process.env.SPOTIFY_API_CLIENT_SECRET_ID,
    private readonly spotifySecretField = process.env.SPOTIFY_API_CLIENT_SECRET_FIELD,
    private readonly spotifyClientId = process.env.SPOTIFY_API_CLIENT_ID,
    private spotifyTokenCacheDurationSeconds = 0
  ) {
  }

  async searchSong(searchTerm: string): Promise<SpotifyApi.TrackObjectFull[]> {
    await this.prepareSpotifyWebApiInstance()
    const searchResponse = await this.spotifyApi.searchTracks(searchTerm)
    return searchResponse.body.tracks.items
  }

  private async prepareSpotifyWebApiInstance(): Promise<void> {
    if (!this.timestampRetrieveAccessToken || this.renewCachedToken()) {
      logger.info('retrieving new access token for Spotify API')
      const secretObj = await this.getSecret()
      const spotifyClientSecret: string = secretObj[this.spotifySecretField]
      this.spotifyApi = new SpotifyWebApi({
        clientId: this.spotifyClientId,
        clientSecret: spotifyClientSecret
      })
      this.timestampRetrieveAccessToken = Date.now()
      const clientCredResponse = await this.spotifyApi.clientCredentialsGrant()
      this.spotifyApi.setAccessToken(clientCredResponse.body['access_token'])
      this.spotifyTokenCacheDurationSeconds = clientCredResponse.body['expires_in']
      logger.info(`The access token expires in ${this.spotifyTokenCacheDurationSeconds} seconds`)
    }
  }

  private renewCachedToken(): boolean {
    const now = Date.now()
    const timeDiffSeconds = Math.abs(now - this.timestampRetrieveAccessToken) / 1000
    return timeDiffSeconds > 0.9 * this.spotifyTokenCacheDurationSeconds
  }

  private async getSecret(): Promise<any> {
    if (!this.cachedSecret) {
      const secretsManagerClient = new AWS.SecretsManager()
      const data = await secretsManagerClient.getSecretValue({
        SecretId: this.spotifySecretId
      }).promise()
      this.cachedSecret = JSON.parse(data.SecretString)
    }

    return this.cachedSecret
  }

}
