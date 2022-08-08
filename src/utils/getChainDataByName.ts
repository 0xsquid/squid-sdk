import { ChainName, chainsData } from '../contants/chains'
import { Environments } from '../types'

/**
 * @param {ChainName} name
 * @param {Environments} env
 */
export const getChainDataByName = (name: ChainName, env: Environments) =>
  chainsData[name][env]
