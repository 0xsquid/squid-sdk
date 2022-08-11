import { TokenData } from '../types'

export const getTokenData = (
  tokens: TokenData[],
  address: string
): TokenData | undefined => tokens.find(e => e.address === address)
