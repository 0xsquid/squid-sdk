import { supportedTokens } from '../contants/tokens'
import { Environments, ITokenData } from '../types'

/**
 * @param {string} symbol could be an enum as it's more rubost validation
 * @param {Environments} env
 */
export const getTokenData = (
  token: string,
  env: Environments
): ITokenData | undefined =>
  supportedTokens[env].find(e => e.symbol === token || e.address === token)
