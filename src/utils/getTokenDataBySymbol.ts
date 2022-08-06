import { supportedTokens } from "../contants/tokens"
import { Environments, ITokenData } from "../types"

/**
 * @param {string} symbol could be an enum as it's more rubost validation 
 */
export const getIBySymbol = (symbol: string, env: Environments): ITokenData | undefined =>
  supportedTokens[env].find(e => e.symbol === symbol)