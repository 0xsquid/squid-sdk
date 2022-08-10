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

export interface ChainsData {
  [Environments.LOCAL]: {
    [ChainName.ETHEREUM]: ChainData
    [ChainName.AVALANCHE]: ChainData
    [ChainName.MOONBEAM]: ChainData
  }
  [Environments.TESTNET]: {
    [ChainName.ETHEREUM]: ChainData
    [ChainName.AVALANCHE]: ChainData
    [ChainName.MOONBEAM]: ChainData
  }
  [Environments.MAINNET]: {
    [ChainName.ETHEREUM]: ChainData
    [ChainName.AVALANCHE]: ChainData
    [ChainName.MOONBEAM]: ChainData
  }
}

export type MapChainIdName = {
  [key: number]: ChainName
}

export interface ITokenData {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  crosschain: boolean
  commonKey: string
  logoURI: string
}

export interface IConfig {
  apiKey?: string
  environment: Environments
}

export interface IGetRoute {
  srcChain: string
  srcToken: string
  destChain: string
  destToken: string
  amount: string
}

export interface IGetTx {
  recipientAddress: string
  srcChain: ChainName
  srcTokenIn: string
  srcInAmount: string
  dstChain: ChainName
  dstTokenOut: string
  slippage: number // validate usage
}

// this interface should be imported from ethers?
export interface ITransaction {
  to?: string
  data?: ArrayLike<number>
  value?: bigint
}
