import { describe, expect } from "@jest/globals";
import { parseSdkInfoResponse } from "./sdk-info";

describe("sdk-info", () => {
  const data = {
    chains: [
      {
        chainName: "Ethereum",
        chainType: "evm",
        rpc: "https://eth-rpc.gateway.pokt.network",
        internalRpc:
          "https://mainnet.infura.io/v3/273aad656cd94f9aa022e4899b87dd6c",
        networkName: "Mainnet",
        chainId: 1,
        nativeCurrency: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18,
          icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
        },
        chainIconURI: "https://axelarscan.io/logos/chains/ethereum.svg",
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
          squidRouter: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
          defaultCrosschainToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          squidMulticall: "0x28D04fD16B2D7b8c0FDAdb821E381b72fe3CC11e"
        },
        estimatedRouteDuration: 900
      },
      {
        chainName: "crescent",
        chainType: "cosmos",
        rpc: "https://mainnet.crescent.network:26657",
        internalRpc: "https://mainnet.crescent.network:26657",
        rest: "https://mainnet.crescent.network:1317",
        networkName: "Crescent",
        chainId: "crescent-1",
        nativeCurrency: {
          name: "Crescent",
          symbol: "CRE",
          decimals: 6,
          icon: "https://assets.coingecko.com/coins/images/25061/small/logo_200x200.png?1649943220"
        },
        chainIconURI: "https://axelarscan.io/logos/chains/crescent.svg",
        blockExplorerUrls: ["https://www.mintscan.io/crescent"],
        bip44: {
          coinType: 118
        },
        bech32Config: {
          bech32PrefixAccAddr: "cre",
          bech32PrefixAccPub: "crepub",
          bech32PrefixValAddr: "crevaloper",
          bech32PrefixValPub: "crevaloperpub",
          bech32PrefixConsAddr: "crevalcons",
          bech32PrefixConsPub: "crevalconspub"
        },
        currencies: [
          {
            coinDenom: "CRE",
            coinMinimalDenom: "ucre",
            coinDecimals: 6,
            coingeckoId: "crescent"
          }
        ],
        feeCurrencies: [
          {
            coinDenom: "CRE",
            coinMinimalDenom: "ucre",
            coinDecimals: 6,
            coingeckoId: "crescent"
          }
        ],
        stakeCurrency: {
          coinDenom: "CRE",
          coinMinimalDenom: "ucre",
          coinDecimals: 6,
          coingeckoId: "crescent"
        },
        coinType: 118,
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1
        },
        features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
        estimatedRouteDuration: 180,
        squidContracts: {
          defaultCrosschainToken: "uusdc"
        },
        axelarContracts: {
          gateway: ""
        },
        chainToAxelarChannelId: "channel-4"
      }
    ],
    tokens: [
      {
        chainId: 1,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logoURI:
          "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
        coingeckoId: "ethereum"
      },
      {
        chainId: 1,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        name: "Wrapped ETH",
        symbol: "WETH",
        decimals: 18,
        logoURI:
          "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295",
        coingeckoId: "weth"
      },
      {
        name: "Dai Stablecoin",
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimals: 18,
        chainId: 1,
        logoURI:
          "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
        coingeckoId: "dai"
      }
    ],
    axelarscanURL: "https://axelarscan.io/"
  };
  describe("parseSdkInfoResponse", () => {
    describe("exact match", () => {
      const selected = data;
      const result = parseSdkInfoResponse(selected);
      it("should contain two chains", () => {
        expect(result.chains.length).toEqual(2);
      });
      it("should contain 3 tokens", () => {
        expect(result.tokens.length).toEqual(3);
      });
      it("should contain axelarscanURL", () => {
        expect(result).toHaveProperty("axelarscanURL");
      });
    });
  });
});
