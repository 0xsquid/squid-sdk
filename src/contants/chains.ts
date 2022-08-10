import { ChainName, ChainsData, Environments, MapChainIdName } from '../types'

const ethBase = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
  estimatedGas: 300000
}

const avaxBase = {
  name: 'Avalanche',
  symbol: 'AVAX',
  decimals: 18,
  icon: 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818',
  estimatedGas: 300000
}

const moonbeamBase = {
  name: 'Moonbeam',
  symbol: 'GLMR',
  decimals: 18,
  icon: 'https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985',
  estimatedGas: 300000
}

export const mapChainIdName: MapChainIdName = {
  1: ChainName.ETHEREUM,
  3: ChainName.ETHEREUM,
  43113: ChainName.AVALANCHE,
  43114: ChainName.AVALANCHE,
  1287: ChainName.MOONBEAM,
  1284: ChainName.MOONBEAM
}

export const chainsData: ChainsData = {
  [Environments.LOCAL]: {
    [ChainName.ETHEREUM]: {
      rpc: 'http://localhost:8500/0',
      networkName: 'Ethereum Local',
      chainId: 1,
      contracts: {
        gateway: '0x4F4495243837681061C4743b74B3eEdf548D56A5', // axelar gateway contract
        swapExecutor: '0x77FB9b9d8A2b5F2aaa69b622E0BD217ad056a4b2', // squidswap contracts
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // swap router address uniswap etc
        axelarDefaultCrosschain: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        wrappedNativeToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        distributionEnsExecutable: '0xd67877578aA2ffd9508a164E14e60680c6b96619', // DistributionENSExecutable.sol
        multicall: '0x431E942ff3960CBa17044B1e6Be9cF62e3b63055', // batch read transactions,
        ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
      },
      ...ethBase
    },
    [ChainName.AVALANCHE]: {
      rpc: 'http://localhost:8500/1',
      networkName: 'Avalanche Local',
      chainId: 43114,
      contracts: {
        gateway: '0x5029C0EFf6C34351a0CEc334542cDb22c7928f78',
        swapExecutor: '0x77FB9b9d8A2b5F2aaa69b622E0BD217ad056a4b2',
        router: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
        axelarDefaultCrosschain: '0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC',
        wrappedNativeToken: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        distributionEnsExecutable: '0xd67877578aA2ffd9508a164E14e60680c6b96619',
        multicall: '0x431E942ff3960CBa17044B1e6Be9cF62e3b63055',
        ensRegistry: '0xa7eebb2926d22d34588497769889cbc2be0a5d97'
      },
      ...avaxBase
    },
    [ChainName.MOONBEAM]: {
      rpc: 'http://localhost:8500/2',
      networkName: 'Moonbeam Local',
      chainId: 1284,
      contracts: {
        gateway: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
        swapExecutor: '0x77FB9b9d8A2b5F2aaa69b622E0BD217ad056a4b2',
        router: '0x70085a09D30D6f8C4ecF6eE10120d1847383BB57',
        axelarDefaultCrosschain: '0xCa01a1D0993565291051daFF390892518ACfAD3A',
        wrappedNativeToken: '0xCa01a1D0993565291051daFF390892518ACfAD3A',
        distributionEnsExecutable: '0xd67877578aA2ffd9508a164E14e60680c6b96619',
        multicall: '0x431E942ff3960CBa17044B1e6Be9cF62e3b63055',
        ensRegistry: ''
      },
      ...moonbeamBase
    }
  },
  [Environments.TESTNET]: {
    [ChainName.ETHEREUM]: {
      rpc: 'https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9',
      networkName: 'ETH Ropsten Testnet',
      chainId: 3,
      contracts: {
        gateway: '0xBC6fcce7c5487d43830a219CA6E7B83238B41e71',
        swapExecutor: '0xdAA3Cab203c974F0B071C363258B3fEF45f9cC6f',
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        axelarDefaultCrosschain: '0x526f0a95edc3df4cbdb7bb37d4f7ed451db8e369',
        wrappedNativeToken: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        distributionEnsExecutable: '0xb123d4aA48fC5012293cf4BFD3659277468e27Cf',
        multicall: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
        ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
      },
      ...ethBase
    },
    [ChainName.AVALANCHE]: {
      rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
      networkName: 'Avalanche FUJI C-Chain Testnet',
      chainId: 43113,
      contracts: {
        gateway: '0xC249632c2D40b9001FE907806902f63038B737Ab',
        swapExecutor: '0x84500e012FCD0a89a6C8f463Dd334E305f76f52B',
        router: '0x2D99ABD9008Dc933ff5c0CD271B88309593aB921',
        axelarDefaultCrosschain: '0x57f1c63497aee0be305b8852b354cec793da43bb',
        wrappedNativeToken: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
        distributionEnsExecutable: '0xf6Da84C51b5C82039E9E3c64ccb3F1b05d7EF1Be',
        multicall: '0x3D015943d2780fE97FE3f69C97edA2CCC094f78c',
        ensRegistry: '0xa7eebb2926d22d34588497769889cbc2be0a5d97'
      },
      ...avaxBase
    },
    [ChainName.MOONBEAM]: {
      rpc: 'https://rpc.api.moonbase.moonbeam.network',
      networkName: 'Moonbase Alpha Testnet',
      chainId: 1287,
      contracts: {
        gateway: '0x5769D84DD62a6fD969856c75c7D321b84d455929',
        swapExecutor: '0x84500e012FCD0a89a6C8f463Dd334E305f76f52B',
        router: '0xF75F62464fb6ae6E7088b76457E164EeCfB07dB4',
        axelarDefaultCrosschain: '0xd1633f7fb3d716643125d6415d4177bc36b7186b',
        wrappedNativeToken: '0x372d0695E75563D9180F8CE31c9924D7e8aaac47',
        distributionEnsExecutable: '0xD05180187165eED557c90AB907D1C0B1dd35bDD6',
        multicall: '0x4E2cfca20580747AdBA58cd677A998f8B261Fc21',
        ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
      },
      ...moonbeamBase
    }
  },
  [Environments.MAINNET]: {
    [ChainName.ETHEREUM]: {
      rpc: '',
      networkName: 'Mainnet',
      chainId: 1,
      contracts: {
        gateway: '',
        swapExecutor: '',
        router: '',
        axelarDefaultCrosschain: '',
        wrappedNativeToken: '',
        distributionEnsExecutable: '',
        multicall: '',
        ensRegistry: ''
      },
      ...ethBase
    },
    [ChainName.AVALANCHE]: {
      rpc: '',
      networkName: 'Avalanche Mainnet',
      chainId: 43114,
      contracts: {
        gateway: '',
        swapExecutor: '',
        router: '',
        axelarDefaultCrosschain: '',
        wrappedNativeToken: '',
        distributionEnsExecutable: '',
        multicall: '',
        ensRegistry: ''
      },
      ...avaxBase
    },
    [ChainName.MOONBEAM]: {
      rpc: '',
      networkName: 'Moonbeam Mainnet',
      chainId: 1284,
      contracts: {
        gateway: '',
        swapExecutor: '',
        router: '',
        axelarDefaultCrosschain: '',
        wrappedNativeToken: '',
        distributionEnsExecutable: '',
        multicall: '',
        ensRegistry: ''
      },
      ...moonbeamBase
    }
  }
}
