import {
  AxelarQueryAPI,
  AxelarQueryAPIConfig,
  EvmChain,
  GasToken,
} from '@axelar-network/axelarjs-sdk'
import axios, { AxiosInstance } from 'axios'
import { ethers } from 'ethers'
import * as dotenv from 'dotenv'

import { getTokenDataBySymbol } from './utils/getTokenDataBySymbol'
import { Environments, IConfig, IGetTx, ITransaction } from './types'

import erc20Abi from './abi/erc20.json'
import { getChainDataByName } from './utils/getChainDataByName'

dotenv.config()

const squidContractAddress = process.env.squidContractAddress
const baseUrl = process.env.baseUrl

class SquidSdk {
  private axiosInstance: AxiosInstance
  private environment: Environments

  constructor(config: IConfig) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        // 'api-key': config.apiKey
      },
    })
    this.environment = config.environment
  }

  public async getTx(params: IGetTx): Promise<ITransaction> {
    const tokenIn = getTokenDataBySymbol(params.srcTokenIn, this.environment)
    const tokenOut = getTokenDataBySymbol(params.dstTokenOut, this.environment)
    const srcChain = getChainDataByName(params.srcChain, this.environment)

    console.log('> tokenIn: ', tokenIn)
    console.log('> tokenOut: ', tokenOut)
    console.log('> srcChain: ', srcChain)

    if (!tokenIn || !tokenOut) {
      throw new Error(
        `Error: Token not found, srcTokenIn ${tokenIn?.name} dstTokenOut ${tokenOut?.name}`
      )
    }

    if (!srcChain) {
      throw new Error(`Error: Chain not found ${params.srcChain}`)
    }

    const response = await this.axiosInstance.get('/api/transaction', {
      params,
    })

    console.log('> Route type: ', response.data.routeType)
    console.log('> Response: ', response.data)
    console.log('> Destination gas: ', response.data.destChainGas)

    // Set AxelarQueryAPI
    const sdk = new AxelarQueryAPI({
      environment: this.environment as string,
    } as AxelarQueryAPIConfig)

    const gasFee = await sdk.estimateGasFee(
      EvmChain.ETHEREUM,
      EvmChain.AVALANCHE,
      GasToken.ETH,
      response.data.destChainGas
    )

    console.log('> Gas Fee: ', gasFee)

    const provider = new ethers.providers.JsonRpcProvider(srcChain.rpc)
    const srcTokenContract = new ethers.Contract(
      tokenIn.address,
      erc20Abi,
      provider
    )

    // Check source token allowance, needed for best user experience?
    const allowance = await srcTokenContract.allowance(
      params.recipientAddress,
      squidContractAddress
    )

    console.log('> Source token allowance: ', allowance.toString())

    if (allowance < params.srcInAmount) {
      throw new Error(
        `Error: Approved amount ${allowance} is less than send amount ${params.srcInAmount}`
      )
    }

    // Construct transaction object with encoded data
    const tx: ITransaction = {
      to: squidContractAddress,
      data: response.data.data,
      value: BigInt(gasFee), // this will need to be calculated, maybe by the api, also standarice usage of this kind of values
    }

    return tx
  }
}

export default SquidSdk
