import { Environments, ITokenData } from "../types"

export interface ISupportedTokens {
  [Environments.LOCAL]: ITokenData[],
  [Environments.TESTNET]: ITokenData[],
  [Environments.MAINNET]: ITokenData[],
}

export const supportedTokens: ISupportedTokens = {
  [Environments.LOCAL]: [
    {
      chainId: 1284,
      address: "0xAcc15dC74880C9944775448304B263D191c6077F",
      name: "Wrapped GLMR",
      symbol: "WGLMR",
      decimals: 18,
      crosschain: false,
      commonKey: "uwglmr",
      logoURI: "https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985"
    },
    {
      chainId: 1284,
      address: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
      name: "Axelar USD Coin",
      symbol: "axlUSDC",
      decimals: 6,
      commonKey: "uusdc",
      crosschain: true,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
    },
    {
      chainId: 43114,
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      name: "Wrapped AVAX",
      symbol: "WAVAX",
      decimals: 18,
      crosschain: false,
      commonKey: "uawax",
      logoURI: "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png"
    },
    {
      chainId: 43114,
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      name: "Wrapped ETH.e",
      symbol: "WETH.e",
      decimals: 18,
      crosschain: false,
      commonKey: "uwethe",
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295"
    },
    {
      chainId: 43114,
      address: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      name: "Axelar USD Coin",
      symbol: "axlUSDC",
      decimals: 6,
      commonKey: "uusdc",
      crosschain: true,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
    },
    {
      chainId: 43114,
      address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      name: "DAI.e",
      symbol: "DAI.e",
      decimals: 18,
      commonKey: "udaie",
      crosschain: false,
      logoURI: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734"
    },
    {
      chainId: 43114,
      address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
      name: "USDC.e",
      symbol: "USDC.e",
      decimals: 6,
      commonKey: "uusdce",
      crosschain: false,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
    },
    {
      chainId: 1,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      name: "Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
      crosschain: false,
      commonKey: "uweth",
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295"
    },
    {
      chainId: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      commonKey: "uusdc",
      crosschain: true,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
    },
    {
      chainId: 1,
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      name: "USD Tether",
      symbol: "USDT",
      decimals: 6,
      commonKey: "uusdt",
      crosschain: false,
      logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707"
    },
    {
      chainId: 1,
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      name: "DAI",
      symbol: "DAI",
      decimals: 18,
      commonKey: "udai",
      crosschain: false,
      logoURI: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734"
    }
  ],
  [Environments.TESTNET]: [
    {
      chainId: 3,
      address: "0x321C017c08b681b1a34909eb159ed128772a5Bbe",
      name: "Axelar",
      symbol: "AXL",
      decimals: 6,
      crosschain: true,
      commonKey: "uaxl",
      logoURI: "https://assets.coingecko.com/coins/images/24489/small/tsYr25vB_400x400.jpg?1647854949"
    },
    {
      chainId: 3,
      address: "0x526f0a95edc3df4cbdb7bb37d4f7ed451db8e369",
      name: "Axelar USD Coin",
      symbol: "aUSDC",
      decimals: 6,
      commonKey: "uausdc",
      crosschain: true,
      logoURI: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389"
    },
    {
      chainId: 3,
      address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      name: "Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
      commonKey: "uweth",
      crosschain: false,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295"
    },
    {
      chainId: 3,
      address: "0x136c8635c146d4286f0309075bcce4a7f21b6e80",
      name: "Squid",
      symbol: "SQD",
      crosschain: false,
      decimals: 18,
      commonKey: "",
      logoURI: ""
    },
    {
      chainId: 43113,
      address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
      name: "Wrapped AVAX",
      symbol: "WAVAX",
      crosschain: false,
      decimals: 18,
      commonKey: "uwavax",
      logoURI: "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png"
    },
    {
      chainId: 43113,
      address: "0x46Cc87ea84586C03bB2109ED9B33F998d40B7623",
      name: "Axelar",
      symbol: "AXL",
      crosschain: true,
      decimals: 6,
      commonKey: "uaxl",
      logoURI: "https://assets.coingecko.com/coins/images/24489/small/tsYr25vB_400x400.jpg?1647854949"
    },
    {
      chainId: 43113,
      address: "0xBD9919D79ADE4a280Ff357e9E8206141bdbbCcdf",
      name: "Squid",
      symbol: "SQD",
      crosschain: false,
      decimals: 18,
      commonKey: "",
      logoURI: ""
    },
    {
      chainId: 43113,
      address: "0x57f1c63497aee0be305b8852b354cec793da43bb",
      name: "Axelar USD Coin",
      symbol: "aUSDC",
      decimals: 6,
      commonKey: "uausdc",
      crosschain: true,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
    },
    {
      chainId: 1287,
      address: "0x8a6614F33EC72FB70084B22b2EFfb643424e9Cc9",
      name: "Axelar",
      symbol: "AXL",
      decimals: 6,
      commonKey: "uaxl",
      crosschain: true,
      logoURI: "https://assets.coingecko.com/coins/images/24489/small/tsYr25vB_400x400.jpg?1647854949"
    },
    {
      chainId: 1287,
      address: "0x62fB3eD3468275E3676456a49122F6F45803B217",
      name: "Squid",
      symbol: "SQD",
      decimals: 18,
      commonKey: "",
      crosschain: false,
      logoURI: ""
    },
    {
      chainId: 1287,
      address: "0xd1633f7fb3d716643125d6415d4177bc36b7186b",
      name: "Axelar USD Coin",
      symbol: "aUSDC",
      decimals: 6,
      commonKey: "uausdc",
      crosschain: true,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
    },
    {
      chainId: 1287,
      address: "0x372d0695E75563D9180F8CE31c9924D7e8aaac47",
      name: "Wrapped DEV",
      symbol: "WDEV",
      decimals: 18,
      commonKey: "uwdev",
      crosschain: false,
      logoURI: "https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985"
    }
  ],
  [Environments.MAINNET]: []
}
