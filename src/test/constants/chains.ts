import { ChainName, ChainType, NetworkIdentifier } from "@0xsquid/squid-types";

const ethBase = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
};

const avaxBase = {
  name: "Avalanche",
  symbol: "AVAX",
  decimals: 18,
  icon: "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818"
};

const moonbeamBase = {
  name: "Moonbeam",
  symbol: "GLMR",
  decimals: 18,
  icon: "https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985"
};

const squidEvmRouter = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";
const squidEvmMulticall = "0x4fd39C9E151e50580779bd04B1f7eCc310079fd3";

export const chainsData = [
  {
    axelarChainName: ChainName.ETHEREUM,
    networkIdentifier: NetworkIdentifier.ETHEREUM,
    chainType: ChainType.EVM,
    rpc: "https://eth-rpc.gateway.pokt.network",
    internalRpc:
      "https://mainnet.infura.io/v3/273aad656cd94f9aa022e4899b87dd6c",
    networkName: "Ethereum",
    chainId: "1",
    nativeCurrency: ethBase,
    swapAmountForGas: "2000000",
    chainIconURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    blockExplorerUrls: ["https://etherscan.io/"],
    chainNativeContracts: {
      wrappedNativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
      multicall: "0x5e227AD1969Ea493B43F840cfF78d08a6fc17796",
      usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    },
    axelarContracts: {
      gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
      forecallable: ""
    },
    squidContracts: {
      squidRouter: squidEvmRouter,
      defaultCrosschainToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      squidMulticall: squidEvmMulticall
    },
    estimatedRouteDuration: 960,
    estimatedExpressRouteDuration: 20
  },
  {
    axelarChainName: ChainName.AVALANCHE,
    networkIdentifier: NetworkIdentifier.AVALANCHE,
    chainType: ChainType.EVM,
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    internalRpc:
      "https://dark-ultra-night.avalanche-mainnet.quiknode.pro/bf01aaee6c5b3cac3aa57f49a0824ab0ae07277c/ext/bc/C/rpc/",
    networkName: "Avalanche",
    chainId: "43114",
    nativeCurrency: avaxBase,
    swapAmountForGas: "2000000",
    chainIconURI:
      "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818",
    blockExplorerUrls: ["https://snowtrace.io/"],
    chainNativeContracts: {
      wrappedNativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      ensRegistry: "0xa7eebb2926d22d34588497769889cbc2be0a5d97",
      multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
      usdcToken: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
    },
    axelarContracts: {
      gateway: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
      forecallable: ""
    },
    squidContracts: {
      squidRouter: squidEvmRouter,
      defaultCrosschainToken: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      squidMulticall: squidEvmMulticall
    },
    estimatedRouteDuration: 90,
    estimatedExpressRouteDuration: 20
  },
  {
    axelarChainName: ChainName.MOONBEAM,
    networkIdentifier: NetworkIdentifier.MOONBEAM,
    chainType: ChainType.EVM,
    rpc: "https://rpc.api.moonbeam.network",
    internalRpc:
      "https://moonbeam.blastapi.io/590271ba-3954-48a0-8f5b-f90dceb47469", // Moonbeam RPC
    networkName: "Moonbeam",
    chainId: "1284",
    nativeCurrency: moonbeamBase,
    swapAmountForGas: "2000000",
    chainIconURI:
      "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/1c761075a4ae672089c2b1cf25739c6368e97bb7/public/images/chains/moonbeam.svg",
    blockExplorerUrls: ["https://moonscan.io/"],
    chainNativeContracts: {
      wrappedNativeToken: "0xAcc15dC74880C9944775448304B263D191c6077F",
      ensRegistry: "",
      multicall: "0x6477204E12A7236b9619385ea453F370aD897bb2",
      usdcToken: "0x931715fee2d06333043d11f658c8ce934ac61d0c"
    },
    axelarContracts: {
      gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
      forecallable: ""
    },
    squidContracts: {
      squidRouter: squidEvmRouter,
      defaultCrosschainToken: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
      squidMulticall: squidEvmMulticall
    },
    estimatedRouteDuration: 120,
    estimatedExpressRouteDuration: 20
  }
];
