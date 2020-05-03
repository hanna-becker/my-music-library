const apiId = 'sde5ralmqg';
// TODO: change to non-local version
// export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`;
export const apiEndpoint = `http://localhost:3003/dev`;

export const authConfig = {
  domain: 'dev-7pwwdtt2.eu.auth0.com',            // Auth0 domain
  clientId: 'dlbe5kOcmeDUFILXtqEPJKQ3T2mpNRFE',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
};
