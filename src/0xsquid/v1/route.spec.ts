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
  parseTransactionRequest
} from "./route";

describe("route", () => {
  describe("parseBridge", () => {
    describe("exact match", () => {
      const data = {
        type: CallType.BRIDGE,
        fromToken: {} as TokenData,
        toToken: {} as TokenData,
        fromAmount: "1000",
        toAmount: "1000",
        toAmountMin: "1000",
        exchangeRate: "1",
        priceImpact: "0"
      };
      const expected = parseBridge(data);
      it("should match provided data", () => {
        expect(expected).toEqual(data);
      });
      it("should have Bridge type", () => {
        expect(expected.type).toBe(CallType.BRIDGE);
      });
      it("should contain fromToken", () => {
        expect(expected).toHaveProperty("fromToken");
      });
      it("should contain toToken", () => {
        expect(expected).toHaveProperty("toToken");
      });
      it("should contain fromAmount", () => {
        expect(expected).toHaveProperty("fromAmount");
      });
      it("should contain toAmountMin", () => {
        expect(expected).toHaveProperty("toAmountMin");
      });
      it("should contain exchangeRate", () => {
        expect(expected).toHaveProperty("exchangeRate");
      });
      it("should contain priceImpact", () => {
        expect(expected).toHaveProperty("priceImpact");
      });
    });
    describe("additional properties", () => {
      const data = {
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
      const expected = parseBridge(data);
      it("should exclude additional properties", () => {
        expect(expected).not.toHaveProperty("additional");
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
      const expected = parseCustom(data);
      it("should match provided data", () => {
        expect(expected).toEqual(data);
      });
      it("should have type Custom", () => {
        expect(expected.type).toBe(CallType.CUSTOM);
      });
      it("should contain callType", () => {
        expect(expected).toHaveProperty("callType");
      });
      it("should contain target", () => {
        expect(expected).toHaveProperty("target");
      });
      it("should contain callData", () => {
        expect(expected).toHaveProperty("callData");
      });
      it("should not contain optional value", () => {
        expect(expected).not.toHaveProperty("value");
      });
      it("should not contain optional payload", () => {
        expect(expected).not.toHaveProperty("payload");
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
      const expected = parseCustom(data);
      it("should contain optional value", () => {
        expect(expected).toHaveProperty("value");
      });
      it("should contain optional payload", () => {
        expect(expected).toHaveProperty("payload");
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
      const expected = parseBridge(data);
      it("should exclude additional properties", () => {
        expect(expected).not.toHaveProperty("additional");
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
      const expected = parseRoute(data);
      it("should match provided data", () => {
        expect(expected).toEqual(data);
      });
      it("contain all elements", () => {
        expect(expected.length).toBe(3);
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
      const expected = parseRoute(data);
      it("contain filter unsupported elements", () => {
        expect(expected.length).toBe(2);
      });
    });
  });
  describe("parseGasCost", () => {
    describe("exact match", () => {
      const data = [
        {
          type: "dhd",
          token: {} as TokenData,
          amount: "1222",
          amountUSD: "1.2",
          gasPrice: "122",
          maxFeePerGas: "19299",
          maxPriorityFeePerGas: "22718",
          estimate: "3367167",
          limit: "2663"
        }
      ];
      const expected = parseGasCost(data);
      it("contain all elements", () => {
        expect(expected.length).toBe(1);
      });
      it("should have property type", () => {
        expect(expected[0]).toHaveProperty("type");
      });
      it("should have property token", () => {
        expect(expected[0]).toHaveProperty("token");
      });
      it("should have property amount", () => {
        expect(expected[0]).toHaveProperty("amount");
      });
      it("should have property amountUSD", () => {
        expect(expected[0]).toHaveProperty("amountUSD");
      });
      it("should have property gasPrice", () => {
        expect(expected[0]).toHaveProperty("gasPrice");
      });
      it("should have property maxFeePerGas", () => {
        expect(expected[0]).toHaveProperty("maxFeePerGas");
      });
      it("should have property maxPriorityFeePerGas", () => {
        expect(expected[0]).toHaveProperty("maxPriorityFeePerGas");
      });
      it("should have property estimate", () => {
        expect(expected[0]).toHaveProperty("estimate");
      });
      it("should have property limit", () => {
        expect(expected[0]).toHaveProperty("limit");
      });
    });
    describe("additional properties", () => {
      const data = [
        {
          type: "dhd",
          token: {} as TokenData,
          amount: "1222",
          amountUSD: "1.2",
          gasPrice: "122",
          maxFeePerGas: "19299",
          maxPriorityFeePerGas: "22718",
          estimate: "3367167",
          limit: "2663",
          additional: "2663"
        }
      ];
      const expected = parseGasCost(data);
      it("should filter additional properties", () => {
        expect(expected[0]).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseFeeCost", () => {
    describe("exact match", () => {
      const data = [
        {
          name: "name",
          description: "description",
          percentage: "ss",
          token: {} as TokenData,
          amount: "1222",
          amountUSD: "1.2"
        }
      ];
      const expected = parseFeeCost(data);
      it("contain all elements", () => {
        expect(expected.length).toBe(1);
      });
      it("should have property name", () => {
        expect(expected[0]).toHaveProperty("name");
      });
      it("should have property token", () => {
        expect(expected[0]).toHaveProperty("token");
      });
      it("should have property description", () => {
        expect(expected[0]).toHaveProperty("description");
      });
      it("should have property percentage", () => {
        expect(expected[0]).toHaveProperty("percentage");
      });
      it("should have property amount", () => {
        expect(expected[0]).toHaveProperty("amount");
      });
      it("should have property amountUSD", () => {
        expect(expected[0]).toHaveProperty("amountUSD");
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
      const expected = parseFeeCost(data);
      it("should filter additional properties", () => {
        expect(expected[0]).not.toHaveProperty("additional");
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
      const expected = parseParams(data);
      it("should have property slippage", () => {
        expect(expected).toHaveProperty("slippage");
      });
      it("should have property toAddress", () => {
        expect(expected).toHaveProperty("toAddress");
      });
      it("should have property fromAmount", () => {
        expect(expected).toHaveProperty("fromAmount");
      });
      it("should have property fromToken", () => {
        expect(expected).toHaveProperty("fromToken");
      });
      it("should have property toChain", () => {
        expect(expected).toHaveProperty("toChain");
      });
      it("should have property fromChain", () => {
        expect(expected).toHaveProperty("fromChain");
      });
      it("should not include optional property enableForecall", () => {
        expect(expected).not.toHaveProperty("enableForecall");
      });
    });
    describe("optional properties", () => {
      const data = {
        enableForecall: true,
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
      const expected = parseParams(data);
      it("should have optional property enableForecall", () => {
        expect(expected).toHaveProperty("enableForecall");
      });
      it("should have optional property customContractCalls", () => {
        expect(expected).toHaveProperty("customContractCalls");
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
      const expected = parseOptimalRoute(data);
      it("should match provided data", () => {
        expect(expected).toEqual(data);
      });
      it("contain all elements", () => {
        expect(expected.fromChain.length).toBe(3);
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
      const expected = parseOptimalRoute(data);
      it("contain filter unsupported elements", () => {
        expect(expected.fromChain.length).toBe(2);
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

      const expected = parseSwap(data);
      it("should match provided data", () => {
        expect(expected).toEqual(data);
      });
      it("should have type SWAP", () => {
        expect(expected.type).toBe(CallType.SWAP);
      });
      it("should contain dex", () => {
        expect(expected).toHaveProperty("dex");
      });
      it("should contain path", () => {
        expect(expected).toHaveProperty("path");
      });
      it("should contain fromToken", () => {
        expect(expected).toHaveProperty("fromToken");
      });
      it("should contain toToken", () => {
        expect(expected).toHaveProperty("toToken");
      });
      it("should contain fromAmount", () => {
        expect(expected).toHaveProperty("fromAmount");
      });
      it("should contain toAmountMin", () => {
        expect(expected).toHaveProperty("toAmountMin");
      });
      it("should contain exchangeRate", () => {
        expect(expected).toHaveProperty("exchangeRate");
      });
      it("should contain priceImpact", () => {
        expect(expected).toHaveProperty("priceImpact");
      });
      it("should not contain optional dynamicSlippage", () => {
        expect(expected).not.toHaveProperty("dynamicSlippage");
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
      const expected = parseSwap(data);
      it("should contain dynamicSlippage", () => {
        expect(expected).toHaveProperty("dynamicSlippage");
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
      const expected = parseSwap(data);
      it("should exclude additional properties", () => {
        expect(expected).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseEstimate", () => {
    describe("exact match", () => {
      const data = {
        fromAmount: "10000000000000000000",
        sendAmount: "114162617",
        toAmount: "3439190381416687260",
        toAmountMin: "3439190381416687260",
        route: {
          fromChain: [
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
                "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
                "0x57f1c63497aee0be305b8852b354cec793da43bb"
              ],
              squidCallType: 2,
              fromToken: {
                chainId: 43113,
                address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
                name: "Wrapped AVAX",
                symbol: "WAVAX",
                decimals: 18,
                logoURI:
                  "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png",
                coingeckoId: "wrapped-avax"
              },
              toToken: {
                chainId: 43113,
                address: "0x57f1c63497aee0be305b8852b354cec793da43bb",
                name: "Axelar USDC",
                symbol: "aUSDC",
                decimals: 6,
                logoURI:
                  "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
                coingeckoId: "axlusdc"
              },
              fromAmount: "10000000000000000000",
              toAmount: "114162617",
              toAmountMin: "36101389",
              exchangeRate: "19.350796253794892915",
              priceImpact: "41.0",
              dynamicSlippage: 68.37722339831622
            }
          ],
          toChain: [
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
                "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
                "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
              ],
              squidCallType: 1,
              fromToken: {
                chainId: 5,
                address: "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
                name: "Axelar USDC",
                symbol: "aUSDC",
                decimals: 6,
                logoURI:
                  "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389",
                coingeckoId: "axlusdc"
              },
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
              fromAmount: "114162617",
              toAmount: "3439190381416687260",
              toAmountMin: "1087567491221995327",
              exchangeRate: "0.040734858081397255",
              priceImpact: "26.05",
              dynamicSlippage: 68.37722339831622
            }
          ]
        },
        feeCosts: [
          {
            name: "Gas Receiver Fee",
            description: "Estimated Gas Receiver fee",
            percentage: "0",
            token: {
              chainId: 43113,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              name: "Avalanche",
              symbol: "AVAX",
              decimals: 18,
              logoURI:
                "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png",
              coingeckoId: "avalanche-2"
            },
            amount: "2666301478109481960",
            amountUSD: "18.1575"
          }
        ],
        gasCosts: [
          {
            type: "executeCall",
            token: {
              chainId: 43113,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              name: "Avalanche",
              symbol: "AVAX",
              decimals: 18,
              logoURI:
                "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo_24.png",
              coingeckoId: "avalanche-2"
            },
            amount: "19570000000000000",
            amountUSD: "0.2665",
            gasPrice: "25000000000",
            maxFeePerGas: "51500000000",
            maxPriorityFeePerGas: "1500000000",
            estimate: "380000",
            limit: "475000"
          }
        ],
        estimatedRouteDuration: 180,
        exchangeRate: "0.343919038141668726",
        aggregatePriceImpact: "56.37"
      };
      const expected = parseEstimate(data);
      it("should match provided data", () => {
        expect(expected).toEqual(data);
      });
      it("should contain fromAmount", () => {
        expect(expected).toHaveProperty("fromAmount");
      });
      it("should contain sendAmount", () => {
        expect(expected).toHaveProperty("sendAmount");
      });
      it("should contain toAmount", () => {
        expect(expected).toHaveProperty("toAmount");
      });
      it("should contain toAmountMin", () => {
        expect(expected).toHaveProperty("toAmountMin");
      });
      it("should contain route", () => {
        expect(expected).toHaveProperty("route");
      });
      it("should contain feeCosts", () => {
        expect(expected).toHaveProperty("feeCosts");
      });
      it("should contain gasCosts", () => {
        expect(expected).toHaveProperty("gasCosts");
      });
      it("should contain estimatedRouteDuration", () => {
        expect(expected).toHaveProperty("estimatedRouteDuration");
      });
      it("should contain exchangeRate", () => {
        expect(expected).toHaveProperty("exchangeRate");
      });
      it("should contain aggregatePriceImpact", () => {
        expect(expected).toHaveProperty("aggregatePriceImpact");
      });
    });
  });
  describe("parseTransactionRequest", () => {
    describe("exact match", () => {
      const data = {
        routeType: "CALL_BRIDGE_CALL",
        targetAddress: "0xC3468a191Fe51815b26535ED1F82C1f79e6Ec37D",
        data: "0x8ca3bf6800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008ac7230489e8000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000003a00000000000000000000000005f88ec396607fc3edb0424e8e6061949e6b624e70000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000a457468657265756d2d3200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000561555344430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000002d99abd9008dc933ff5c0cd271b88309593ab921000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e4a2a1623d000000000000000000000000000000000000000000000000000000000226dd0d0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000c3468a191fe51815b26535ed1f82c1f79e6ec37d000000000000000000000000000000000000000000000000000001847f0da3890000000000000000000000000000000000000000000000000000000000000002000000000000000000000000d00ae08403b9bbb9124bb305c09058e32c39a48c00000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000254d06f33bdc5b8ee05b2ea472107e300226659a0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000254d06f33bdc5b8ee05b2ea472107e300226659a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000254d06f33bdc5b8ee05b2ea472107e300226659a000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000010438ed17390000000000000000000000000000000000000000000000000000000006cdfbb90000000000000000000000000000000000000000000000000f17d0deff8cbf3f00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000005f88ec396607fc3edb0424e8e6061949e6b624e7000000000000000000000000000000000000000000000000000001847f0da38b0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000254d06f33bdc5b8ee05b2ea472107e300226659a000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000254d06f33bdc5b8ee05b2ea472107e300226659a0000000000000000000000000000000000000000000000000000000000000000",
        value: "12666301478109481960",
        gasLimit: "475000",
        gasPrice: "25000000000",
        maxFeePerGas: "51500000000",
        maxPriorityFeePerGas: "1500000000"
      };
      const expected = parseTransactionRequest(data);
      it("should match provided data", () => {
        expect(expected).toEqual(data);
      });
      it("should contain routeType", () => {
        expect(expected).toHaveProperty("routeType");
      });
      it("should contain targetAddress", () => {
        expect(expected).toHaveProperty("targetAddress");
      });
      it("should contain data", () => {
        expect(expected).toHaveProperty("data");
      });
      it("should contain value", () => {
        expect(expected).toHaveProperty("value");
      });
      it("should contain gasLimit", () => {
        expect(expected).toHaveProperty("gasLimit");
      });
      it("should contain gasPrice", () => {
        expect(expected).toHaveProperty("gasPrice");
      });
      it("should contain gasCosts", () => {
        expect(expected).toHaveProperty("gasCosts");
      });
      it("should contain maxFeePerGas", () => {
        expect(expected).toHaveProperty("maxFeePerGas");
      });
      it("should contain maxPriorityFeePerGas", () => {
        expect(expected).toHaveProperty("maxPriorityFeePerGas");
      });
    });
  });
});
