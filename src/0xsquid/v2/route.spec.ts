import { describe, expect } from "@jest/globals";
import {
  parseEstimate,
  parseFeeCost,
  parseGasCost,
  parseParams,
  parseTransactionRequest,
  parseRouteResponse
} from "./route";
import { Token } from "@0xsquid/squid-types";

describe("route", () => {
  const fullResponse = {
    route: {
      estimate: {
        actions: [
          {
            type: "bridge",
            chainType: "evm",
            fromChainId: "5",
            toChainId: "80001",
            details: {
              bridgeName: "uausdc",
              bridgeProvider: "axelar",
              fromToken: {
                type: "evm",
                chainId: "5",
                address: "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
                name: "Axelar USDC",
                symbol: "aUSDC",
                decimals: 6,
                logoURI:
                  "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389",
                coingeckoId: "axlusdc",
                commonKey: "uausdc",
                usdPrice: 1
              },
              toToken: {
                type: "evm",
                chainId: "80001",
                address: "0x2c852e740B62308c46DD29B982FBb650D063Bd07",
                name: "Axelar USDC",
                symbol: "aUSDC",
                decimals: 6,
                logoURI:
                  "https://s2.coinmarketcap.com/static/img/coins/64x64/21420.png",
                coingeckoId: "usd-coin",
                commonKey: "uausdc"
              },
              sendAmount: "3000000",
              receiveAmount: "3000000",
              exchangeRate: 1
            },
            stage: 0
          },
          {
            type: "custom",
            chainType: "evm",
            fromChainId: "5",
            toChainId: "80001",
            details: {
              calls: [
                {
                  callType: 1,
                  target: "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
                  value: "0",
                  callData:
                    "0xa9059cbb000000000000000000000000bc6fcce7c5487d43830a219ca6e7b83238b41e710000000000000000000000000000000000000000000000000000000000000000",
                  payload: {
                    tokenAddress: "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
                    inputPos: 1
                  },
                  estimatedGas: "70000",
                  chainType: "evm"
                }
              ]
            },
            stage: 1
          }
        ],
        fromAmount: "3000000",
        toAmount: "3000000",
        toAmountMin: "3000000",
        sendAmount: "3000000",
        exchangeRate: "1.0",
        aggregatePriceImpact: "0.0",
        estimatedRouteDuration: 20,
        fromAmountUSD: "3.0",
        toAmountUSD: "2.998929",
        isExpressSupported: false,
        feeCosts: [
          {
            name: "Gas Receiver Fee",
            description: "Gas receiver fee",
            percentage: "",
            token: {
              type: "evm",
              chainId: "5",
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
              logoURI:
                "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
              coingeckoId: "ethereum",
              commonKey: "eth-wei",
              usdPrice: 1919.73
            },
            amount: "258988288000",
            amountUSD: "0.000"
          }
        ],
        gasCosts: [
          {
            type: "executeCall",
            token: {
              type: "evm",
              chainId: "5",
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
              logoURI:
                "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
              coingeckoId: "ethereum",
              commonKey: "eth-wei",
              usdPrice: 1919.73
            },
            amount: "33504588450375000",
            gasLimit: "187500",
            amountUSD: "64.320"
          }
        ]
      },
      params: {
        fromChain: "5",
        toChain: "80001",
        fromToken: "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
        toToken: "0x2c852e740B62308c46DD29B982FBb650D063Bd07",
        fromAmount: "3000000",
        toAddress: "0x5F88eC396607Fc3edb0424E8E6061949e6b624e7",
        slippage: "1.5"
      },
      transactionRequest: {
        routeType: "CALL_BRIDGE_CALL",
        target: "0xC3468a191Fe51815b26535ED1F82C1f79e6Ec37D",
        data: "0x8ca3bf680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000003a00000000000000000000000005f88ec396607fc3edb0424e8e6061949e6b624e7000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000094176616c616e6368650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000561555344430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e47ff36ab50000000000000000000000000000000000000000000000000000000000026d840000000000000000000000000000000000000000000000000000000000000080000000000000000000000000c3468a191fe51815b26535ed1f82c1f79e6ec37d000000000000000000000000000000000000000000000000000001848a65982a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6000000000000000000000000254d06f33bdc5b8ee05b2ea472107e300226659a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000000000000000000000000000000000000000000100000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b30000000000000000000000002d99abd9008dc933ff5c0cd271b88309593ab921000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000002d99abd9008dc933ff5c0cd271b88309593ab921000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000104676528d100000000000000000000000000000000000000000000000000000000000270a6000000000000000000000000000000000000000000000000001c439678e68ac200000000000000000000000000000000000000000000000000000000000000a00000000000000000000000005f88ec396607fc3edb0424e8e6061949e6b624e7000000000000000000000000000000000000000000000000000001848a65982b000000000000000000000000000000000000000000000000000000000000000200000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb000000000000000000000000d00ae08403b9bbb9124bb305c09058e32c39a48c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000057f1c63497aee0be305b8852b354cec793da43bb0000000000000000000000000000000000000000000000000000000000000000",
        value: "10287178075739780",
        gasLimit: "638250",
        gasPrice: "44644279998",
        maxFeePerGas: "90402406090",
        maxPriorityFeePerGas: "1500000000"
      }
    }
  };
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
      it("should have property limit", () => {
        expect(result[0]).toHaveProperty("gasLimit");
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
          token: {} as Token,
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
        toToken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
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
      it("should contain actions", () => {
        expect(result).toHaveProperty("actions");
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
        expect(result).toHaveProperty("target");
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
      const selected = { data: fullResponse };
      const result = parseRouteResponse(selected, {});
      it("should match provided data", () => {
        expect(result).toEqual(fullResponse);
      });
    });
  });
});
