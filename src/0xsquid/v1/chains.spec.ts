import {
  parseEvmChain,
  parseBaseChain,
  parseChainData,
  parseCosmosChain,
  parseSquidContracts,
  parseAxelarContracts
} from "./chains";
import { ChainType, CosmosChain } from "../../types";

describe("chains", () => {
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
    ]
  };
  describe("parseSquidContracts", () => {
    describe("exact match", () => {
      const selected = { ...data.chains[0].squidContracts };
      delete (selected as any).defaultCrosschainToken;
      delete (selected as any).squidMulticall;
      const expected = parseSquidContracts(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
      it("should contain squidRouter", () => {
        expect(expected).toHaveProperty("squidRouter");
      });
      it("should contain defaultCrosschainToken", () => {
        expect(expected).not.toHaveProperty("defaultCrosschainToken");
      });
      it("should contain squidMulticall", () => {
        expect(expected).not.toHaveProperty("squidMulticall");
      });
    });
    describe("optional properties", () => {
      const selected = { ...data.chains[0].squidContracts };
      const expected = parseSquidContracts(selected);
      it("should contain defaultCrosschainToken", () => {
        expect(expected).toHaveProperty("defaultCrosschainToken");
      });
      it("should contain squidMulticall", () => {
        expect(expected).toHaveProperty("squidMulticall");
      });
    });
  });
  describe("parseAxelarContracts", () => {
    describe("exact match", () => {
      const selected = { ...data.chains[0].axelarContracts };
      delete (selected as any).forecallable;
      const expected = parseAxelarContracts(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
      it("should contain gateway", () => {
        expect(expected).toHaveProperty("gateway");
      });
      it("should contain forecallable", () => {
        expect(expected).not.toHaveProperty("forecallable");
      });
    });
    describe("optional properties", () => {
      const selected = { ...data.chains[0].axelarContracts };
      const expected = parseAxelarContracts(selected);
      it("should contain forecallable", () => {
        expect(expected).toHaveProperty("forecallable");
      });
    });
  });
  describe("parseBaseChain", () => {
    describe("exact match", () => {
      const selected = { ...data.chains[0] };
      delete selected.chainNativeContracts;
      const expected = parseBaseChain(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
      it("should have Bridge type", () => {
        expect(expected.chainType).toBe(ChainType.EVM);
      });
      it("should contain chainName", () => {
        expect(expected).toHaveProperty("chainName");
      });
      it("should contain rpc", () => {
        expect(expected).toHaveProperty("rpc");
      });
      it("should contain internalRpc", () => {
        expect(expected).toHaveProperty("internalRpc");
      });
      it("should contain networkName", () => {
        expect(expected).toHaveProperty("networkName");
      });
      it("should contain chainId", () => {
        expect(expected).toHaveProperty("chainId");
      });
      it("should contain nativeCurrency", () => {
        expect(expected).toHaveProperty("nativeCurrency");
      });
      it("should contain chainIconURI", () => {
        expect(expected).toHaveProperty("chainIconURI");
      });
      it("should contain blockExplorerUrls", () => {
        expect(expected).toHaveProperty("blockExplorerUrls");
      });
      it("should contain axelarContracts", () => {
        expect(expected).toHaveProperty("axelarContracts");
      });
      it("should contain squidContracts", () => {
        expect(expected).toHaveProperty("squidContracts");
      });
      it("should contain estimatedRouteDuration", () => {
        expect(expected).toHaveProperty("estimatedRouteDuration");
      });
    });
  });
  describe("parseEvmChain", () => {
    describe("exact match", () => {
      const selected = data.chains[0];
      const expected = parseEvmChain(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
      it("should have Bridge type", () => {
        expect(expected.chainType).toBe(ChainType.EVM);
      });
      it("should contain chainName", () => {
        expect(expected).toHaveProperty("chainName");
      });
      it("should contain rpc", () => {
        expect(expected).toHaveProperty("rpc");
      });
      it("should contain internalRpc", () => {
        expect(expected).toHaveProperty("internalRpc");
      });
      it("should contain networkName", () => {
        expect(expected).toHaveProperty("networkName");
      });
      it("should contain chainId", () => {
        expect(expected).toHaveProperty("chainId");
      });
      it("should contain nativeCurrency", () => {
        expect(expected).toHaveProperty("nativeCurrency");
      });
      it("should contain chainIconURI", () => {
        expect(expected).toHaveProperty("chainIconURI");
      });
      it("should contain blockExplorerUrls", () => {
        expect(expected).toHaveProperty("blockExplorerUrls");
      });
      it("should contain chainNativeContracts", () => {
        expect(expected).toHaveProperty("chainNativeContracts");
      });
      it("should contain axelarContracts", () => {
        expect(expected).toHaveProperty("axelarContracts");
      });
      it("should contain squidContracts", () => {
        expect(expected).toHaveProperty("squidContracts");
      });
      it("should contain estimatedRouteDuration", () => {
        expect(expected).toHaveProperty("estimatedRouteDuration");
      });
    });
  });
  describe("parseCosmosChain", () => {
    describe("exact match", () => {
      const selected = { ...data.chains[1] };
      delete (selected as CosmosChain).coinType;
      delete (selected as CosmosChain).features;
      delete (selected as CosmosChain).gasPriceStep;
      const expected = parseCosmosChain(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
      it("should have Bridge type", () => {
        expect(expected.chainType).toBe(ChainType.Cosmos);
      });
      it("should contain chainName", () => {
        expect(expected).toHaveProperty("chainName");
      });
      it("should contain rpc", () => {
        expect(expected).toHaveProperty("rpc");
      });
      it("should contain internalRpc", () => {
        expect(expected).toHaveProperty("internalRpc");
      });
      it("should contain networkName", () => {
        expect(expected).toHaveProperty("networkName");
      });
      it("should contain chainId", () => {
        expect(expected).toHaveProperty("chainId");
      });
      it("should contain nativeCurrency", () => {
        expect(expected).toHaveProperty("nativeCurrency");
      });
      it("should contain chainIconURI", () => {
        expect(expected).toHaveProperty("chainIconURI");
      });
      it("should contain blockExplorerUrls", () => {
        expect(expected).toHaveProperty("blockExplorerUrls");
      });
      it("should contain axelarContracts", () => {
        expect(expected).toHaveProperty("axelarContracts");
      });
      it("should contain squidContracts", () => {
        expect(expected).toHaveProperty("squidContracts");
      });
      it("should contain estimatedRouteDuration", () => {
        expect(expected).toHaveProperty("estimatedRouteDuration");
      });
    });
    describe("optional properties", () => {
      const selected = { ...data.chains[1] };
      const expected = parseCosmosChain(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
      it("should have ChainType.Cosmos", () => {
        expect(expected.chainType).toBe(ChainType.Cosmos);
      });
      it("should contain optional chainId", () => {
        expect(expected).toHaveProperty("chainId");
      });
      it("should contain optional coinType", () => {
        expect(expected).toHaveProperty("coinType");
      });
      it("should contain optional features", () => {
        expect(expected).toHaveProperty("features");
      });
      it("should contain optional blockExplorerUrls", () => {
        expect(expected).toHaveProperty("blockExplorerUrls");
      });
      it("should contain optional axelarContracts", () => {
        expect(expected).toHaveProperty("axelarContracts");
      });
      it("should contain optional squidContracts", () => {
        expect(expected).toHaveProperty("squidContracts");
      });
      it("should contain optional gasPriceStep", () => {
        expect(expected).toHaveProperty("gasPriceStep");
      });
    });
  });
  describe("parseChainData", () => {
    describe("exact match", () => {
      const selected = data.chains;
      const expected = parseChainData(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
    });
  });
});
