import { describe, expect } from "@jest/globals";
import { CallType, SquidCallType, TokenData } from "../../types";
import { parseBridge, parseSwap, parseCustom, parseRouteData } from "./route";

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
});
