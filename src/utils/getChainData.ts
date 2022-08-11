import { mapChainIdName } from '../contants/chains'
import { ChainData, ChainName, ChainsData } from '../types'

/**
 * @param {ChainsData} chains
 * @param {ChainName | number} chain
 */
export const getChainData = (
  chains: ChainsData,
  chain: ChainName | number
): ChainData | undefined => {
  if (typeof chain === 'string') {
    return chains[chain as ChainName]
  }

  return chains[mapChainIdName[chain as number]]
}
