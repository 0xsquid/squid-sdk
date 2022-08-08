import { Environments } from '../types'

export enum ChainName {
  ETHEREUM = 'Ethereum',
  AVALANCHE = 'Avalanche',
  MOONBEAM = 'Moonbeam',
}

const ethBase = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
  estimatedGas: 300000,
}

const avaxBase = {
  name: 'Avalanche',
  symbol: 'AVAX',
  decimals: 18,
  icon: 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818',
  estimatedGas: 300000,
}

const moonbeamBase = {
  name: 'Moonbeam',
  symbol: 'GLMR',
  decimals: 18,
  icon: 'https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985',
  estimatedGas: 300000,
}

export const chainsData = {
  [ChainName.ETHEREUM]: {
    [Environments.LOCAL]: {
      rpc: 'http://localhost:8500/0',
      networkName: 'Ethereum Local',
      chainId: 1,
      ...ethBase,
    },
    [Environments.TESTNET]: {
      rpc: 'https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9',
      networkName: 'ETH Ropsten Testnet',
      chainId: 3,
      ...ethBase,
    },
    [Environments.MAINNET]: {
      rpc: '',
      networkName: 'Mainnet',
      chainId: 1,
      ...ethBase,
    },
  },
  [ChainName.AVALANCHE]: {
    [Environments.LOCAL]: {
      rpc: 'http://localhost:8500/1',
      networkName: 'Avalanche Local',
      chainId: 43114,
      ...avaxBase,
    },
    [Environments.TESTNET]: {
      rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
      networkName: 'Avalanche FUJI C-Chain Testnet',
      chainId: 43113,
      ...avaxBase,
    },
    [Environments.MAINNET]: {
      rpc: '',
      networkName: 'Avalanche Mainnet',
      chainId: 43114,
      ...avaxBase,
    },
  },
  [ChainName.MOONBEAM]: {
    [Environments.LOCAL]: {
      rpc: 'http://localhost:8500/2',
      networkName: 'Moonbeam Local',
      chainId: 1284,
      ...moonbeamBase,
    },
    [Environments.TESTNET]: {
      rpc: 'https://rpc.api.moonbase.moonbeam.network',
      networkName: 'Moonbase Alpha Testnet',
      chainId: 1287,
      ...moonbeamBase,
    },
    [Environments.MAINNET]: {
      rpc: '',
      networkName: 'Moonbeam Mainnet',
      chainId: 1284,
      ...moonbeamBase,
    },
  },
}
