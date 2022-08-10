import { chainsData, mapChainIdName } from '../contants/chains'
import { Environments, ChainName } from '../types'

/**
 * @param {ChainName} name
 * @param {Environments} env
 */
export const getChainData = (chain: ChainName | number, env: Environments) => {
  if (typeof chain === 'string') {
    return chainsData[env][chain as ChainName]
  }

  return chainsData[env][mapChainIdName[chain as number]]
}
