const ethBase = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  estimatedGas: 300000
};

const avaxBase = {
  name: "Avalanche",
  symbol: "AVAX",
  decimals: 18,
  icon: "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818",
  estimatedGas: 300000
};

const moonbeamBase = {
  name: "Moonbeam",
  symbol: "GLMR",
  decimals: 18,
  icon: "https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985",
  estimatedGas: 300000
};

export const chainsData = {
  Ethereum: {
    chainType: "evm",
    rpc: "http://localhost:8500/0",
    networkName: "Ethereum Local",
    chainId: 1,
    nativeCurrency: ethBase,
    blockExplorerUrls: [],
    chainNativeContracts: {
      wrappedNativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      distributionEnsExecutable: "0xd67877578aA2ffd9508a164E14e60680c6b96619",
      ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
      multicall: "0x431E942ff3960CBa17044B1e6Be9cF62e3b63055"
    },
    squidConfig: [
      {
        type: "singleSwap",
        chainId: 1,
        gasUsage: 3000000
      },
      {
        type: "doubleSwap",
        chainId: 1,
        gasUsage: 6000000
      }
    ],
    axelarContracts: {
      gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
      forecallable: ""
    },
    squidContracts: {
      squidMain: "0x9BDFDef799b4884D134c6783d0Ae98079e1b04b9",
      defaultCrosschainToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    },
    integrationContracts: {
      dexUniswapV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      dexCurve: ""
    }
  },
  Avalanche: {
    chainType: "evm",
    rpc: "http://localhost:8500/1",
    networkName: "Avalanche Local",
    chainId: 43114,
    nativeCurrency: avaxBase,
    blockExplorerUrls: [],
    chainNativeContracts: {
      wrappedNativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      distributionEnsExecutable: "0xd67877578aA2ffd9508a164E14e60680c6b96619",
      ensRegistry: "0xa7eebb2926d22d34588497769889cbc2be0a5d97",
      multicall: "0x431E942ff3960CBa17044B1e6Be9cF62e3b63055"
    },
    squidConfig: [
      {
        type: "singleSwap",
        chainId: 1,
        gasUsage: 3000000
      },
      {
        type: "doubleSwap",
        chainId: 1,
        gasUsage: 6000000
      }
    ],
    axelarContracts: {
      gateway: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
      forecallable: ""
    },
    squidContracts: {
      squidMain: "0x9BDFDef799b4884D134c6783d0Ae98079e1b04b9",
      defaultCrosschainToken: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC"
    },
    integrationContracts: {
      dexUniswapV2: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
      dexCurve: ""
    }
  },
  Moonbeam: {
    chainType: "evm",
    rpc: "http://localhost:8500/2",
    networkName: "Moonbeam Local",
    chainId: 1284,
    nativeCurrency: moonbeamBase,
    blockExplorerUrls: [],
    chainNativeContracts: {
      wrappedNativeToken: "0xAcc15dC74880C9944775448304B263D191c6077F",
      distributionEnsExecutable: "0xd67877578aA2ffd9508a164E14e60680c6b96619",
      ensRegistry: "",
      multicall: "0x431E942ff3960CBa17044B1e6Be9cF62e3b63055"
    },
    squidConfig: [
      {
        type: "singleSwap",
        chainId: 1,
        gasUsage: 3000000
      },
      {
        type: "doubleSwap",
        chainId: 1,
        gasUsage: 6000000
      }
    ],
    axelarContracts: {
      gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
      forecallable: ""
    },
    squidContracts: {
      squidMain: "0x9BDFDef799b4884D134c6783d0Ae98079e1b04b9",
      defaultCrosschainToken: "0xCa01a1D0993565291051daFF390892518ACfAD3A"
    },
    integrationContracts: {
      dexUniswapV2: "0x70085a09D30D6f8C4ecF6eE10120d1847383BB57",
      dexCurve: ""
    }
  }
};
