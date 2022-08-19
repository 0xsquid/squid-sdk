import { ethers } from 'ethers'

export enum Environment {
  LOCAL = 'local',
  TESTNET = 'testnet',
  MAINNET = 'mainnet'
}

export enum ChainName {
  ETHEREUM = 'Ethereum',
  AVALANCHE = 'Avalanche',
  MOONBEAM = 'Moonbeam'
}

export type MapChainIdName = {
  [key: number]: ChainName
}

export type squidConfig = {
  type: string
  chainId: number
  gasUsage: number
}

export type ChainData = {
  chainType: string
  chainId: number
  networkName: string
  rpc: string
  blockExplorerUrls: string[]
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
    icon: string
  }
  squidConfig: squidConfig[]
  chainNativeContracts: {
    wrappedNativeToken: string
    distributionEnsExecutable: string
    ensRegistry: string
    multicall: string
  }
  axelarContracts: {
    gateway: string
    forecallable: string
  }
  squidContracts: {
    squidMain: string
    defaultCrosschainToken: string
  }
  integrationContracts: {
    dexUniswapV2: string
    dexCurve: string
  }
}

export type ChainsData = {
  [ChainName.ETHEREUM]: ChainData
  [ChainName.AVALANCHE]: ChainData
  [ChainName.MOONBEAM]: ChainData
}

export type TokenData = {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  crosschain: boolean
  commonKey: string
  logoURI: string
}

export type Config = {
  apiKey?: string
  environment: Environment
  baseUrl?: string
}

export type GetRoute = {
  sourceChainId: number
  destinationChainId: number
  sourceTokenAddress: string
  destinationTokenAddress: string
  sourceAmount: string
  recipientAddress: string
  slippage: number
}

export type RouteData = {
  sourceAmount: string
  sendDestinationAmount: number
  swapDestinationAmount: string
}

export type TransactionRequest = {
  routeType: string
  gasReceiver: boolean
  data: string
  destinationChainGas: number
}

export type Route = {
  routeData: RouteData
  transactionRequest: TransactionRequest
  params: GetRoute
}

export type GetRouteResponse = {
  route: Route
}

export type ExecuteRoute = {
  signer: ethers.Wallet
  route: Route
}
