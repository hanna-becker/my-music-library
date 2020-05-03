import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'

import {decode, verify} from 'jsonwebtoken'
import {createLogger} from '../../utils/logger'
import {Jwt} from '../../auth/Jwt'
import {JwtPayload} from '../../auth/JwtPayload'
import Axios from 'axios'


const logger = createLogger('auth');

// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-7pwwdtt2.eu.auth0.com/.well-known/jwks.json';

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken);
    try {
        const jwtToken: JwtPayload = await verifyToken(event.authorizationToken);
        logger.info('User was authorized', jwtToken);

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', {error: e.message});

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const token = getToken(authHeader);
    const cert = await getCertificate(token);
    return await verify(token, cert, {algorithms: ['RS256']}) as JwtPayload;
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');

    return split[1];
}


async function getCertificate(token: string): Promise<string> {
    logger.info('Getting certificate');
    const jwt: Jwt = decode(token, {complete: true}) as Jwt;
    const keyId: string = jwt.header.kid;
    const response = await Axios.get(jwksUrl);
    const jwks = response.data;
    const signingKey = jwks.keys.find(key => key.kid === keyId);
    const cert = signingKey.x5c[0];
    return certToPEM(cert);
}

// Source: https://github.com/sgmeyer/auth0-node-jwks-rs256/blob/master/src/lib/utils.js
function certToPEM(cert) {
    let pem = cert.match(/.{1,64}/g).join('\n');
    pem = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----\n`;
    return pem;
}
