import { ethers } from 'ethers'

export enum Environments {
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
  environment: Environments
  shouldApprove?: boolean
  shouldValidateApproval?: boolean
  baseUrl?: string
}

export type GetRoute = {
  srcChain: ChainName | number
  dstChain: ChainName | number
  srcToken: string
  dstToken: string
  amount: string
  recipientAddress: string
  slippage: number
  env: Environments
}

export type RouteData = {
  amount: string
  sendDstAmount: number
  swapDstAmount: string
}

export type TransactionRequest = {
  routeType: string
  gasReceiver: boolean
  data: string
  dstChainGas: number
}

export type GetRouteResponse = {
  routeData: RouteData
  transactionRequest: TransactionRequest
}

export type ExecuteRoute = {
  signer: ethers.Wallet
  transactionRequest: TransactionRequest
  params: GetRoute
}
