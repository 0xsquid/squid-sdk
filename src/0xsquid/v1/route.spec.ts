import { describe, expect } from "@jest/globals";
import { CallType, SquidCallType, TokenData } from "../../types";

import {
  parseBridge,
  parseCustom,
  parseRoute,
  parseEstimate,
  parseFeeCost,
  parseGasCost,
  parseParams,
  parseOptimalRoute,
  parseSwap,
  parseTransactionRequest,
  parseRouteResponse
} from "./route";

describe("route", () => {
  const fullResponse = {
    route: {
      estimate: {
        fromAmount: "10000000000000000",
        sendAmount: "159910",
        toAmount: "7995691808494645",
        toAmountMin: "7995691808494645",
        route: {
          fromChain: [
            {
              type: "SWAP",
              dex: {
                chainName: "Ethereum-2",
                dexName: "UniswapV2",
                swapRouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
                isStable: false
              },
              path: [
                "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
                "0x254d06f33bDc5b8ee05b2ea472107E300226659A"
              ],
              squidCallType: 2,
              fromToken: {
                chainId: 5,
                address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
                name: "Wrapped ETH",
                symbol: "WETH",
                decimals: 18,
                logoURI:
                  "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295",
                coingeckoId: "weth"
              },
              toToken: {
                chainId: 5,
                address: "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
                name: "Axelar USDC",
                symbol: "aUSDC",
                decimals: 6,
                logoURI:
                  "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389",
                coingeckoId: "axlusdc"
              },
              fromAmount: "10000000000000000",
              toAmount: "159910",
              toAmountMin: "159108",
              exchangeRate: "16.044011900580685916",
              priceImpact: "0.33",
              dynamicSlippage: 0.5012562893380035
            }
          ],
          toChain: [
            {
              type: "SWAP",
              dex: {
                chainName: "Avalanche",
                dexName: "Pangolin",
                swapRouter: "0x2D99ABD9008Dc933ff5c0CD271B88309593aB921",
                factory: "0xE4A575550C2b460d2307b82dCd7aFe84AD1484dd",
                isStable: false
              },
              path: [
                "0x57f1c63497aee0be305b8852b354cec793da43bb",
                "0xd00ae08403B9bbb9124bB305C09058E32C39A48c"
              ],
              squidCallType: 1,
              fromToken: {
                chainId: 43113,
                address: "0x57f1c63497aee0be305b8852b354cec793da43bb",
                name: "Axelar USDC",
                symbol: "aUSDC",
                decimals: 6,
                logoURI:
                  "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
                coingeckoId: "axlusdc"
              },
              toToken: {
                chainId: 43113,
                address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
                name: "Wrapped AVAX",
                symbol: "WAVAX",
                decimals: 18,
                logoURI:
                  "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png",
                coingeckoId: "wrapped-avax"
              },
              fromAmount: "159910",
              toAmount: "7995691808494645",
              toAmountMin: "7955612900428482",
              exchangeRate: "0.050179811924277089",
              priceImpact: "0.36",
              dynamicSlippage: 0.5012562893380035
            }
          ]
        },
        feeCosts: [
          {
            name: "Gas Receiver Fee",
            description: "Estimated Gas Receiver fee",
            percentage: "0",
            token: {
              chainId: 5,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
              logoURI:
                "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
              coingeckoId: "ethereum"
            },
            amount: "287178075739780",
            amountUSD: "0.1755"
          }
        ],
        gasCosts: [
          {
            type: "executeCall",
            token: {
              chainId: 5,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
              logoURI:
                "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
              coingeckoId: "ethereum"
            },
            amount: "50173335379950000",
            amountUSD: "61.3344",
            gasPrice: "44644279998",
            maxFeePerGas: "90402406090",
            maxPriorityFeePerGas: "1500000000",
            estimate: "555000",
            limit: "638250"
          }
        ],
        estimatedRouteDuration: 900,
        exchangeRate: "0.7995691808494645",
        aggregatePriceImpact: "0.69"
      },
      params: {
        enableExpress: true,
        slippage: 1,
        toAddress: "0x5F88eC396607Fc3edb0424E8E6061949e6b624e7",
        fromAmount: "10000000000000000",
        toToken: {
          chainId: 43113,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          name: "Avalanche",
          symbol: "AVAX",
          decimals: 18,
          logoURI:
            "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png",
          coingeckoId: "avalanche-2"
        },
        fromToken: {
          chainId: 5,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18,
          logoURI:
            "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
          coingeckoId: "ethereum"
        },
        toChain: "43113",
        fromChain: "5"
      },
      transactionRequest: {
        routeType: "CALL_BRIDGE_CALL",
        targetAddress: "0xC3468a191Fe51815b26535ED1F82C1f79e6Ec37D",
        data: "0x8ca3bf680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000003a00000000000000000000000005f88ec396607fc3edb0424e8e6061949e6b624e7000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000094176616c616e6368650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000561555344430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e47ff36ab50000000000000000000000000000000000000000000000000000000000026d840000000000000000000000000000000000000000000000000000000000000080000000000000000000000000c3468a191fe51815b26535ed1f82c1f79e6ec37d000000000000000000000000000000000000000000000000000001848a65982a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6000000000000000000000000254d06f33bdc5b8ee05b2ea472107e300226659a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000000000000000000000000000000000000000000100000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b30000000000000000000000002d99abd9008dc933ff5c0cd271b88309593ab921000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000002d99abd9008dc933ff5c0cd271b88309593ab921000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000104676528d100000000000000000000000000000000000000000000000000000000000270a6000000000000000000000000000000000000000000000000001c439678e68ac200000000000000000000000000000000000000000000000000000000000000a00000000000000000000000005f88ec396607fc3edb0424e8e6061949e6b624e7000000000000000000000000000000000000000000000000000001848a65982b000000000000000000000000000000000000000000000000000000000000000200000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000d00ae08403b9bbb9124bb305c09058e32c39a48c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb0000000000000000000000000000000000000000000000000000000000000000",
        value: "10287178075739780",
        gasLimit: "638250",
        gasPrice: "44644279998",
        maxFeePerGas: "90402406090",
        maxPriorityFeePerGas: "1500000000"
      }
    }
  };
  describe("parseBridge", () => {
    describe("exact match", () => {
      const selected = {
        type: CallType.BRIDGE,
        fromToken: {} as TokenData,
        toToken: {} as TokenData,
        fromAmount: "1000",
        toAmount: "1000",
        toAmountMin: "1000",
        exchangeRate: "1",
        priceImpact: "0"
      };
      const result = parseBridge(selected);
      it("should match provided data", () => {
        expect(result).toEqual(selected);
      });
      it("should have Bridge type", () => {
        expect(result.type).toBe(CallType.BRIDGE);
      });
      it("should contain fromToken", () => {
        expect(result).toHaveProperty("fromToken");
      });
      it("should contain toToken", () => {
        expect(result).toHaveProperty("toToken");
      });
      it("should contain fromAmount", () => {
        expect(result).toHaveProperty("fromAmount");
      });
      it("should contain toAmountMin", () => {
        expect(result).toHaveProperty("toAmountMin");
      });
      it("should contain exchangeRate", () => {
        expect(result).toHaveProperty("exchangeRate");
      });
      it("should contain priceImpact", () => {
        expect(result).toHaveProperty("priceImpact");
      });
    });
    describe("additional properties", () => {
      const selected = {
        type: CallType.BRIDGE,
        fromToken: {} as TokenData,
        toToken: {} as TokenData,
        fromAmount: "1000",
        toAmount: "1000",
        toAmountMin: "1000",
        exchangeRate: "1",
        priceImpact: "0",
        additional: ""
      };
      const result = parseBridge(selected);
      it("should exclude additional properties", () => {
        expect(result).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseCustom", () => {
    describe("exact match", () => {
      const data = {
        type: CallType.CUSTOM,
        callType: 1,
        target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        callData:
          "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        estimatedGas: "400000"
      };
      const result = parseCustom(data);
      it("should match provided data", () => {
        expect(result).toEqual(data);
      });
      it("should have type Custom", () => {
        expect(result.type).toBe(CallType.CUSTOM);
      });
      it("should contain callType", () => {
        expect(result).toHaveProperty("callType");
      });
      it("should contain target", () => {
        expect(result).toHaveProperty("target");
      });
      it("should contain callData", () => {
        expect(result).toHaveProperty("callData");
      });
      it("should not contain optional value", () => {
        expect(result).not.toHaveProperty("value");
      });
      it("should not contain optional payload", () => {
        expect(result).not.toHaveProperty("payload");
      });
    });
    describe("optionals", () => {
      const data = {
        callType: 1,
        target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        value: "0",
        callData:
          "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        payload: {
          tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          inputPos: 1
        },
        estimatedGas: "400000"
      };
      const result = parseCustom(data);
      it("should contain optional value", () => {
        expect(result).toHaveProperty("value");
      });
      it("should contain optional payload", () => {
        expect(result).toHaveProperty("payload");
      });
    });
    describe("additional properties", () => {
      const data = {
        callType: 1,
        target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        callData:
          "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        estimatedGas: "400000",
        additional: "223"
      };
      const result = parseBridge(data);
      it("should exclude additional properties", () => {
        expect(result).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseRoute", () => {
    describe("exact match", () => {
      const data = [
        {
          type: CallType.CUSTOM,
          callType: 1,
          target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          callData:
            "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          estimatedGas: "400000"
        },
        {
          type: CallType.SWAP,
          dex: { chainName: "", dexName: "", swapRouter: "" },
          path: [],
          squidCallType: SquidCallType.COLLECT_TOKEN_BALANCE,
          fromToken: {} as TokenData,
          toToken: {} as TokenData,
          fromAmount: "1000",
          toAmount: "1000",
          toAmountMin: "1000",
          exchangeRate: "1",
          priceImpact: "0",
          dynamicSlippage: "sww"
        },
        {
          type: CallType.BRIDGE,
          fromToken: {} as TokenData,
          toToken: {} as TokenData,
          fromAmount: "1000",
          toAmount: "1000",
          toAmountMin: "1000",
          exchangeRate: "1",
          priceImpact: "0"
        }
      ];
      const result = parseRoute(data);
      it("should match provided data", () => {
        expect(result).toEqual(data);
      });
      it("contain all elements", () => {
        expect(result.length).toBe(3);
      });
    });
    describe("optionals", () => {
      const data = [
        {
          type: CallType.CUSTOM,
          callType: 1,
          target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          callData:
            "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          estimatedGas: "400000"
        },
        {
          test: "test"
        },
        {
          type: CallType.CUSTOM,
          fromToken: {} as TokenData,
          toToken: {} as TokenData,
          fromAmount: "1000",
          toAmount: "1000",
          toAmountMin: "1000",
          exchangeRate: "1",
          priceImpact: "0"
        }
      ];
      const result = parseRoute(data);
      it("contain filter unsupported elements", () => {
        expect(result.length).toBe(2);
      });
    });
  });
  describe("parseGasCost", () => {
    describe("exact match", () => {
      const selected = fullResponse.route.estimate.gasCosts;
      const result = parseGasCost(selected);
      it("contain all elements", () => {
        expect(result.length).toBe(1);
      });
      it("should have property type", () => {
        expect(result[0]).toHaveProperty("type");
      });
      it("should have property token", () => {
        expect(result[0]).toHaveProperty("token");
      });
      it("should have property amount", () => {
        expect(result[0]).toHaveProperty("amount");
      });
      it("should have property amountUSD", () => {
        expect(result[0]).toHaveProperty("amountUSD");
      });
      it("should have property gasPrice", () => {
        expect(result[0]).toHaveProperty("gasPrice");
      });
      it("should have property maxFeePerGas", () => {
        expect(result[0]).toHaveProperty("maxFeePerGas");
      });
      it("should have property maxPriorityFeePerGas", () => {
        expect(result[0]).toHaveProperty("maxPriorityFeePerGas");
      });
      it("should have property estimate", () => {
        expect(result[0]).toHaveProperty("estimate");
      });
      it("should have property limit", () => {
        expect(result[0]).toHaveProperty("limit");
      });
    });
  });
  describe("parseFeeCost", () => {
    describe("exact match", () => {
      const selected = fullResponse.route.estimate.feeCosts;
      const result = parseFeeCost(selected);
      it("contain all elements", () => {
        expect(result.length).toBe(1);
      });
      it("should have property name", () => {
        expect(result[0]).toHaveProperty("name");
      });
      it("should have property token", () => {
        expect(result[0]).toHaveProperty("token");
      });
      it("should have property description", () => {
        expect(result[0]).toHaveProperty("description");
      });
      it("should have property percentage", () => {
        expect(result[0]).toHaveProperty("percentage");
      });
      it("should have property amount", () => {
        expect(result[0]).toHaveProperty("amount");
      });
      it("should have property amountUSD", () => {
        expect(result[0]).toHaveProperty("amountUSD");
      });
    });
    describe("additional properties", () => {
      const data = [
        {
          name: "name",
          description: "description",
          percentage: "ss",
          token: {} as TokenData,
          amount: "1222",
          amountUSD: "1.2",
          additional: ""
        }
      ];
      const result = parseFeeCost(data);
      it("should filter additional properties", () => {
        expect(result[0]).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseParams", () => {
    describe("exact match", () => {
      const data = {
        slippage: 90,
        toAddress: "0x5F88eC396607Fc3edb0424E8E6061949e6b624e7",
        fromAmount: "10000000000000000000",
        toToken: {
          chainId: 5,
          address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          name: "Wrapped ETH",
          symbol: "WETH",
          decimals: 18,
          logoURI:
            "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295",
          coingeckoId: "weth"
        },
        fromToken: {
          chainId: 43113,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          name: "Avalanche",
          symbol: "AVAX",
          decimals: 18,
          logoURI:
            "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png",
          coingeckoId: "avalanche-2"
        },
        toChain: "5",
        fromChain: "43113"
      };
      const result = parseParams(data);
      it("should have property slippage", () => {
        expect(result).toHaveProperty("slippage");
      });
      it("should have property toAddress", () => {
        expect(result).toHaveProperty("toAddress");
      });
      it("should have property fromAmount", () => {
        expect(result).toHaveProperty("fromAmount");
      });
      it("should have property fromToken", () => {
        expect(result).toHaveProperty("fromToken");
      });
      it("should have property toChain", () => {
        expect(result).toHaveProperty("toChain");
      });
      it("should have property fromChain", () => {
        expect(result).toHaveProperty("fromChain");
      });
      it("should not include optional property enableExpress", () => {
        expect(result).not.toHaveProperty("enableExpress");
      });
    });
    describe("optional properties", () => {
      const data = {
        enableExpress: true,
        slippage: 90,
        toAddress: "0x5F88eC396607Fc3edb0424E8E6061949e6b624e7",
        fromAmount: "10000000000000000000",
        toToken: {
          chainId: 5,
          address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          name: "Wrapped ETH",
          symbol: "WETH",
          decimals: 18,
          logoURI:
            "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295",
          coingeckoId: "weth"
        },
        fromToken: {
          chainId: 43113,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          name: "Avalanche",
          symbol: "AVAX",
          decimals: 18,
          logoURI:
            "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png",
          coingeckoId: "avalanche-2"
        },
        toChain: "5",
        fromChain: "43113",
        customContractCalls: [
          {
            type: CallType.CUSTOM,
            callType: 1,
            target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            callData:
              "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            estimatedGas: "400000"
          }
        ]
      };
      const result = parseParams(data);
      it("should have optional property enableExpress", () => {
        expect(result).toHaveProperty("enableExpress");
      });
      it("should have optional property customContractCalls", () => {
        expect(result).toHaveProperty("customContractCalls");
      });
    });
  });
  describe("parseOptimalRoute", () => {
    describe("exact match", () => {
      const data = {
        fromChain: [
          {
            type: CallType.CUSTOM,
            callType: 1,
            target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            callData:
              "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            estimatedGas: "400000"
          },
          {
            type: CallType.SWAP,
            dex: { chainName: "", dexName: "", swapRouter: "" },
            path: [],
            squidCallType: SquidCallType.COLLECT_TOKEN_BALANCE,
            fromToken: {} as TokenData,
            toToken: {} as TokenData,
            fromAmount: "1000",
            toAmount: "1000",
            toAmountMin: "1000",
            exchangeRate: "1",
            priceImpact: "0",
            dynamicSlippage: "sww"
          },
          {
            type: CallType.BRIDGE,
            fromToken: {} as TokenData,
            toToken: {} as TokenData,
            fromAmount: "1000",
            toAmount: "1000",
            toAmountMin: "1000",
            exchangeRate: "1",
            priceImpact: "0"
          }
        ],
        toChain: [
          {
            type: CallType.CUSTOM,
            callType: 1,
            target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            callData:
              "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            estimatedGas: "400000"
          }
        ]
      };
      const result = parseOptimalRoute(data);
      it("should match provided data", () => {
        expect(result).toEqual(data);
      });
      it("contain all elements", () => {
        expect(result.fromChain.length).toBe(3);
      });
    });
    describe("optionals", () => {
      const data = {
        fromChain: [
          {
            type: CallType.CUSTOM,
            callType: 1,
            target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            callData:
              "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            estimatedGas: "400000"
          },
          {
            test: "test"
          },
          {
            type: CallType.CUSTOM,
            fromToken: {} as TokenData,
            toToken: {} as TokenData,
            fromAmount: "1000",
            toAmount: "1000",
            toAmountMin: "1000",
            exchangeRate: "1",
            priceImpact: "0"
          }
        ],
        toChain: []
      };
      const result = parseOptimalRoute(data);
      it("contain filter unsupported elements", () => {
        expect(result.fromChain.length).toBe(2);
      });
    });
  });
  describe("parseSwap", () => {
    describe("exact match", () => {
      const data = {
        type: CallType.SWAP,
        dex: {
          chainName: "sasa",
          dexName: "asas",
          factory: "",
          isStable: true,
          swapRouter: "sas"
        },
        path: [],
        squidCallType: SquidCallType.COLLECT_TOKEN_BALANCE,
        fromToken: {} as TokenData,
        toToken: {} as TokenData,
        fromAmount: "1000",
        toAmount: "1000",
        toAmountMin: "1000",
        exchangeRate: "1",
        priceImpact: "0"
      };

      const result = parseSwap(data);
      it("should match provided data", () => {
        expect(result).toEqual(data);
      });
      it("should have type SWAP", () => {
        expect(result.type).toBe(CallType.SWAP);
      });
      it("should contain dex", () => {
        expect(result).toHaveProperty("dex");
      });
      it("should contain path", () => {
        expect(result).toHaveProperty("path");
      });
      it("should contain fromToken", () => {
        expect(result).toHaveProperty("fromToken");
      });
      it("should contain toToken", () => {
        expect(result).toHaveProperty("toToken");
      });
      it("should contain fromAmount", () => {
        expect(result).toHaveProperty("fromAmount");
      });
      it("should contain toAmountMin", () => {
        expect(result).toHaveProperty("toAmountMin");
      });
      it("should contain exchangeRate", () => {
        expect(result).toHaveProperty("exchangeRate");
      });
      it("should contain priceImpact", () => {
        expect(result).toHaveProperty("priceImpact");
      });
      it("should not contain optional dynamicSlippage", () => {
        expect(result).not.toHaveProperty("dynamicSlippage");
      });
    });
    describe("optionals", () => {
      const data = {
        dex: {
          chainName: "",
          dexName: "",
          swapRouter: "",
          factory: "",
          isStable: true
        },
        path: [],
        squidCallType: SquidCallType.COLLECT_TOKEN_BALANCE,
        fromToken: {} as TokenData,
        toToken: {} as TokenData,
        fromAmount: "1000",
        toAmount: "1000",
        toAmountMin: "1000",
        exchangeRate: "1",
        priceImpact: "0",
        dynamicSlippage: "sww"
      };
      const result = parseSwap(data);
      it("should contain dynamicSlippage", () => {
        expect(result).toHaveProperty("dynamicSlippage");
      });
    });
    describe("additional properties", () => {
      const data = {
        dex: { chainName: "", dexName: "", swapRouter: "" },
        path: [],
        squidCallType: SquidCallType.COLLECT_TOKEN_BALANCE,
        fromToken: {} as TokenData,
        toToken: {} as TokenData,
        fromAmount: "1000",
        toAmount: "1000",
        toAmountMin: "1000",
        exchangeRate: "1",
        priceImpact: "0",
        dynamicSlippage: ""
      };
      const result = parseSwap(data);
      it("should exclude additional properties", () => {
        expect(result).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseEstimate", () => {
    describe("exact match", () => {
      const selected = fullResponse.route.estimate;
      const result = parseEstimate(selected);
      it("should match provided data", () => {
        expect(result).toEqual(selected);
      });
      it("should contain fromAmount", () => {
        expect(result).toHaveProperty("fromAmount");
      });
      it("should contain sendAmount", () => {
        expect(result).toHaveProperty("sendAmount");
      });
      it("should contain toAmount", () => {
        expect(result).toHaveProperty("toAmount");
      });
      it("should contain toAmountMin", () => {
        expect(result).toHaveProperty("toAmountMin");
      });
      it("should contain route", () => {
        expect(result).toHaveProperty("route");
      });
      it("should contain feeCosts", () => {
        expect(result).toHaveProperty("feeCosts");
      });
      it("should contain gasCosts", () => {
        expect(result).toHaveProperty("gasCosts");
      });
      it("should contain estimatedRouteDuration", () => {
        expect(result).toHaveProperty("estimatedRouteDuration");
      });
      it("should contain exchangeRate", () => {
        expect(result).toHaveProperty("exchangeRate");
      });
      it("should contain aggregatePriceImpact", () => {
        expect(result).toHaveProperty("aggregatePriceImpact");
      });
      it("should contain fromAmountUSD", () => {
        expect(result).toHaveProperty("fromAmountUSD");
      });
      it("should contain toAmountUSD", () => {
        expect(result).toHaveProperty("toAmountUSD");
      });
    });
  });
  describe("parseTransactionRequest", () => {
    describe("exact match", () => {
      const selected = fullResponse.route.transactionRequest;
      const result = parseTransactionRequest(selected);
      it("should match provided data", () => {
        expect(result).toEqual(selected);
      });
      it("should contain routeType", () => {
        expect(result).toHaveProperty("routeType");
      });
      it("should contain targetAddress", () => {
        expect(result).toHaveProperty("targetAddress");
      });
      it("should contain data", () => {
        expect(result).toHaveProperty("data");
      });
      it("should contain value", () => {
        expect(result).toHaveProperty("value");
      });
      it("should contain gasLimit", () => {
        expect(result).toHaveProperty("gasLimit");
      });
      it("should contain gasPrice", () => {
        expect(result).toHaveProperty("gasPrice");
      });
      it("should contain gasCosts", () => {
        expect(result).toHaveProperty("gasCosts");
      });
      it("should contain maxFeePerGas", () => {
        expect(result).toHaveProperty("maxFeePerGas");
      });
      it("should contain maxPriorityFeePerGas", () => {
        expect(result).toHaveProperty("maxPriorityFeePerGas");
      });
    });
  });
  describe("parseRouteResponse", () => {
    describe("exact match", () => {
      const selected = fullResponse;
      const result = parseRouteResponse(selected);
      it("should match provided data", () => {
        expect(result).toEqual(selected);
      });
    });
  });
});
