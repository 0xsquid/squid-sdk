import { mapChainIdName } from '../contants/chains'
import { ChainData, ChainsData } from '../types'

export const getChainData = (
  chains: ChainsData,
  chainId: number
): ChainData | undefined => {
  return chains[mapChainIdName[chainId as number]]
}
