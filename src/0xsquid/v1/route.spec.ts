import { describe, expect } from "@jest/globals";
import { CallType, SquidCallType, TokenData } from "../../types";
import {
  parseBridge,
  parseSwap,
  parseCustom,
  parseRouteData,
  parseFeeCost,
  parseGasCost
} from "./route";

describe("route", () => {
  describe("parseBridge", () => {
    describe("exact match", () => {
      const data = {
        fromToken: {} as TokenData,
        toToken: {} as TokenData,
        fromAmount: "1000",
        toAmount: "1000",
        toAmountMin: "1000",
        exchangeRate: "1",
        priceImpact: "0"
      };
      const expected = parseBridge(data);
      it("should have Bridge type", () => {
        expect(expected.type).toBe(CallType.BRIDGE);
      });
      it("should contain fromToken", () => {
        expect(expected.callDetails).toHaveProperty("fromToken");
      });
      it("should contain toToken", () => {
        expect(expected.callDetails).toHaveProperty("toToken");
      });
      it("should contain fromAmount", () => {
        expect(expected.callDetails).toHaveProperty("fromAmount");
      });
      it("should contain toAmountMin", () => {
        expect(expected.callDetails).toHaveProperty("toAmountMin");
      });
      it("should contain exchangeRate", () => {
        expect(expected.callDetails).toHaveProperty("exchangeRate");
      });
      it("should contain priceImpact", () => {
        expect(expected.callDetails).toHaveProperty("priceImpact");
      });
    });
    describe("additional properties", () => {
      const data = {
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
        expect(expected.callDetails).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseSwap", () => {
    describe("exact match", () => {
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
        priceImpact: "0"
      };
      const expected = parseSwap(data);
      it("should have type SWAP", () => {
        expect(expected.type).toBe(CallType.SWAP);
      });
      it("should contain dex", () => {
        expect(expected.callDetails).toHaveProperty("dex");
      });
      it("should contain path", () => {
        expect(expected.callDetails).toHaveProperty("path");
      });
      it("should contain fromToken", () => {
        expect(expected.callDetails).toHaveProperty("fromToken");
      });
      it("should contain toToken", () => {
        expect(expected.callDetails).toHaveProperty("toToken");
      });
      it("should contain fromAmount", () => {
        expect(expected.callDetails).toHaveProperty("fromAmount");
      });
      it("should contain toAmountMin", () => {
        expect(expected.callDetails).toHaveProperty("toAmountMin");
      });
      it("should contain exchangeRate", () => {
        expect(expected.callDetails).toHaveProperty("exchangeRate");
      });
      it("should contain priceImpact", () => {
        expect(expected.callDetails).toHaveProperty("priceImpact");
      });
      it("should not contain optional dynamicSlippage", () => {
        expect(expected.callDetails).not.toHaveProperty("dynamicSlippage");
      });
    });
    describe("optionals", () => {
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
        dynamicSlippage: "sww"
      };
      const expected = parseSwap(data);
      it("should contain dynamicSlippage", () => {
        expect(expected.callDetails).toHaveProperty("dynamicSlippage");
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
      const expected = parseBridge(data);
      it("should exclude additional properties", () => {
        expect(expected.callDetails).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseCustom", () => {
    describe("exact match", () => {
      const data = {
        callType: 1,
        target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        callData:
          "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        estimatedGas: "400000"
      };
      const expected = parseCustom(data);
      it("should have type Custom", () => {
        expect(expected.type).toBe(CallType.CUSTOM);
      });
      it("should contain callType", () => {
        expect(expected.callDetails).toHaveProperty("callType");
      });
      it("should contain target", () => {
        expect(expected.callDetails).toHaveProperty("target");
      });
      it("should contain callData", () => {
        expect(expected.callDetails).toHaveProperty("callData");
      });
      it("should not contain optional value", () => {
        expect(expected.callDetails).not.toHaveProperty("value");
      });
      it("should not contain optional payload", () => {
        expect(expected.callDetails).not.toHaveProperty("payload");
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
        expect(expected.callDetails).toHaveProperty("value");
      });
      it("should contain optional payload", () => {
        expect(expected.callDetails).toHaveProperty("payload");
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
        expect(expected.callDetails).not.toHaveProperty("additional");
      });
    });
  });
  describe("parseRouteData", () => {
    describe("exact match", () => {
      const data = [
        {
          type: CallType.CUSTOM,
          callDetails: {
            callType: 1,
            target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            callData:
              "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            estimatedGas: "400000"
          }
        },
        {
          type: CallType.SWAP,
          callDetails: {
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
          }
        },
        {
          type: CallType.CUSTOM,
          callDetails: {
            fromToken: {} as TokenData,
            toToken: {} as TokenData,
            fromAmount: "1000",
            toAmount: "1000",
            toAmountMin: "1000",
            exchangeRate: "1",
            priceImpact: "0"
          }
        }
      ];
      const expected = parseRouteData(data);
      it("contain all elements", () => {
        expect(expected.length).toBe(3);
      });
    });
    describe("optionals", () => {
      const data = [
        {
          type: CallType.CUSTOM,
          callDetails: {
            callType: 1,
            target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            callData:
              "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            estimatedGas: "400000"
          }
        },
        {
          callDetails: {}
        },
        {
          type: CallType.CUSTOM,
          callDetails: {
            fromToken: {} as TokenData,
            toToken: {} as TokenData,
            fromAmount: "1000",
            toAmount: "1000",
            toAmountMin: "1000",
            exchangeRate: "1",
            priceImpact: "0"
          }
        }
      ];
      const expected = parseRouteData(data);
      it("contain filter unsupported elements", () => {
        expect(expected.length).toBe(2);
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
      console.log(expected);
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
      console.log(expected);
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
});
