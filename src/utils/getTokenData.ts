import { TokenData } from '../types'

/**
 * @param {TokenData} tokens
 * @param {string} token
 */
export const getTokenData = (
  tokens: TokenData[],
  token: string
): TokenData | undefined =>
  tokens.find(e => e.symbol === token || e.address === token)
