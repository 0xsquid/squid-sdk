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
      routeData: response.data.routeData,
      transactionRequest: response.data.transactionRequest
    }
  }

  public async executeRoute({
    signer,
    transactionRequest,
    params
  }: ExecuteRoute): Promise<ethers.providers.TransactionReceipt> {
    if (!this.inited) {
      throw new Error(
        'SquidSdk must be inited! Please call the SquidSdk.init method'
      )
    }

    const srcChain = getChainData(this.chains as ChainsData, params.srcChain)
    const srcToken = getTokenData(this.tokens as TokenData[], params.srcToken)

    if (!srcChain) {
      throw new Error(`srcChain not found for ${params.srcChain}`)
    }

    if (!srcToken) {
      throw new Error(`srcToken not found for ${params.srcToken}`)
    }

    const srcProvider = new ethers.providers.JsonRpcProvider(srcChain.rpc)

    if (this.config.shouldApprove) {
      const contract = new ethers.Contract(srcToken.address, erc20Abi, signer)
      await contract.approve(srcChain.contracts.swapExecutor, params.amount)
    }

    if (this.config.shouldValidateApproval) {
      const srcTokenContract = new ethers.Contract(
        srcToken.address,
        erc20Abi,
        srcProvider
      )

      const allowance = await srcTokenContract.allowance(
        params.recipientAddress,
        srcChain.contracts.swapExecutor
      )

      console.log('> Source token allowance: ', allowance.toString())

      if (allowance < params.amount) {
        throw new Error(
          `Error: Approved amount ${allowance} is less than send amount ${params.amount}`
        )
      }
    }

    const sdk = new AxelarQueryAPI({
      environment: this.config.environment as string
    } as AxelarQueryAPIConfig)

    const gasFee = await sdk.estimateGasFee(
      EvmChain.ETHEREUM,
      EvmChain.AVALANCHE,
      GasToken.ETH,
      transactionRequest.dstChainGas
    )

    const tx = {
      to: srcChain.contracts.swapExecutor,
      data: transactionRequest.data,
      value: BigInt(gasFee) // this will need to be calculated, maybe by the api, also standarice usage of this kind of values
    }

    const signTxResponse = await signer.signTransaction(tx)
    console.log('> signTxResponse: ', signTxResponse)
    const sentTxResponse = await signer.sendTransaction(tx)
    console.log('> sentTxResponse: ', sentTxResponse.hash)
    const txReceipt = await sentTxResponse.wait(1)
    console.log('> txReceipt: ', txReceipt.transactionHash)
    return txReceipt
  }
}

export default SquidSdk
