import {
  AxelarQueryAPI,
  AxelarQueryAPIConfig,
  EvmChain,
  GasToken
} from '@axelar-network/axelarjs-sdk'
import { ethers } from 'ethers'
import axios, { AxiosInstance } from 'axios'
import * as dotenv from 'dotenv'

import {
  ChainsData,
  Config,
  ExecuteRoute,
  GetRoute,
  GetRouteResponse,
  TokenData
} from './types'

import erc20Abi from './abi/erc20.json'
import { getChainData } from './utils/getChainData'
import { getTokenData } from './utils/getTokenData'

dotenv.config()

const baseUrl = process.env.baseUrl

class SquidSdk {
  private axiosInstance: AxiosInstance

  public inited = false
  public config: Config
  public tokens: TokenData[] | undefined = undefined
  public chains: ChainsData | undefined = undefined

  constructor(config: Config) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || baseUrl,
      headers: {
        // 'api-key': config.apiKey
      }
    })
    this.config = config
  }

  public async init() {
    const response = await this.axiosInstance.get('/api/sdk-info', {
      params: { env: this.config.environment }
    })

    this.tokens = response.data.data.tokens
    this.chains = response.data.data.chains
    this.inited = true
  }

  public setConfig(config: Config) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || baseUrl,
      headers: {
        // 'api-key': config.apiKey
      }
    })
    this.config = config
  }

  public async getRoute(params: GetRoute): Promise<GetRouteResponse> {
    if (!this.inited) {
      throw new Error(
        'SquidSdk must be inited! Please call the SquidSdk.init method'
      )
    }

    const response = await this.axiosInstance.get('/api/route', { params })

    return {
      route: response.data.route
    }
  }

  public async executeRoute({
    signer,
    route
  }: ExecuteRoute): Promise<ethers.providers.TransactionResponse> {
    const { transactionRequest, params } = route

    if (!this.inited) {
      throw new Error(
        'SquidSdk must be inited! Please call the SquidSdk.init method'
      )
    }

    const sourceChain = getChainData(
      this.chains as ChainsData,
      params.sourceChainId
    )
    const sourceToken = getTokenData(
      this.tokens as TokenData[],
      params.sourceTokenAddress
    )
    const destinationChain = getChainData(
      this.chains as ChainsData,
      params.destinationChainId
    )

    if (!sourceChain) {
      throw new Error(`sourceChain not found for ${params.sourceChainId}`)
    }

    if (!sourceToken) {
      throw new Error(`sourceToken not found for ${params.sourceTokenAddress}`)
    }

    if (!destinationChain) {
      throw new Error(
        `destinationChain not found for ${params.destinationChainId}`
      )
    }

    const srcProvider = new ethers.providers.JsonRpcProvider(sourceChain.rpc)
    const srcTokenContract = new ethers.Contract(
      sourceToken.address,
      erc20Abi,
      srcProvider
    )

    const allowance = await srcTokenContract.allowance(
      params.recipientAddress,
      sourceChain.squidContracts.squidMain
    )

    if (allowance < params.sourceAmount) {
      const contract = new ethers.Contract(
        sourceToken.address,
        erc20Abi,
        signer
      )
      await contract.approve(
        sourceChain.squidContracts.squidMain,
        params.sourceAmount
      )
    }

    const sdk = new AxelarQueryAPI({
      environment: this.config.environment as string
    } as AxelarQueryAPIConfig)

    const gasFee = await sdk.estimateGasFee(
      sourceChain?.nativeCurrency.name as EvmChain, // EvmChain.ETHEREUM,
      destinationChain?.nativeCurrency.name as EvmChain, // EvmChain.AVALANCHE,
      GasToken.ETH,
      transactionRequest.destinationChainGas
    )

    const tx = {
      to: sourceChain.squidContracts.squidMain,
      data: transactionRequest.data,
      value: BigInt(gasFee) // this will need to be calculated, maybe by the api, also standarice usage of this kind of values
    }

    await signer.signTransaction(tx)
    return await signer.sendTransaction(tx)
  }
}

export default SquidSdk
