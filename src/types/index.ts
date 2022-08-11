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

export type ChainData = {
  rpc: string
  networkName: string
  chainId: number
  name: string
  symbol: string
  decimals: number
  icon: string
  estimatedGas: number
  contracts: {
    gateway: string // axelar gateway contract
    swapExecutor: string // squidswap contracts
    router: string // swap router address uniswap etc
    axelarDefaultCrosschain: string // USDC
    wrappedNativeToken: string // WETH
    distributionEnsExecutable: string // DistributionENSExecutable.sol
    multicall: string // batch read transactions,
    ensRegistry: string
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
  shouldApprove?: boolean
  shouldValidateApproval?: boolean
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
  env: Environment
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
