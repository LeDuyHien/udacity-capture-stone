import { APIGatewayTokenAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import Axios from 'axios'
import { JwtPayload, verify } from 'jsonwebtoken'
import { createLogger } from '../../helpers/logging/logger'

const log = createLogger('auth')

const jwksUrl = 'https://dev-pbq7cmhfxdhm2atk.us.auth0.com/.well-known/jwks.json'

export const auth = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    console.log('User was authorized', event)
    const jwtToken = await verifyToken({ authHeader: event.authorizationToken })

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
    log.error('User not authorized', { error: e.message })

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
}

async function verifyToken({ authHeader }: { authHeader: any }) {
  // TODO: Implement token verification
  try {
    const token = getToken({ authHeader: authHeader })
    const res = await Axios.get(jwksUrl)

    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
    const pemData = res['data']['keys'][0]['x5c'][0]
    const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`

    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  } catch (err) {
    log.error('Fail to authenticate', err)
  }
}

function getToken({ authHeader }: { authHeader: any }) {
  if (!authHeader) throw new Error('Authentication header is required')

  if (!authHeader.toUpperCase().startsWith('BEARER '))
    throw new Error('Authentication header is invalid')

  return authHeader.split(' ')[1]
}
