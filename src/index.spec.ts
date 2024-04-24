import { SlippageMode } from "@0xsquid/squid-types";
import { Squid } from "./index";

let squid: Squid;
const testIntegratorId = "test-api";
const testBaseUrl = "https://api.uatsquidrouter.com/";

describe("Squid", () => {
  beforeAll(() => {
    squid = new Squid({
      baseUrl: testBaseUrl,
      integratorId: testIntegratorId,
    });

    return squid.init();
  });

  describe("getTokenPrice", () => {
    it("should return token price", async () => {
      const tokenPrice = await squid.getTokenPrice({
        tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        chainId: "1",
      });

      expect(typeof tokenPrice).toEqual("number");
    });

    it("should return 400 error if token address is invalid", async () => {
      try {
        await squid.getTokenPrice({
          tokenAddress: "0x",
          chainId: "1",
        });
      } catch (error) {
        expect(error.response.status).toEqual(400);
      }
    });

    it("should return 400 error if chain id is invalid", async () => {
      try {
        await squid.getTokenPrice({
          tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          chainId: "",
        });
      } catch (error) {
        expect(error.response.status).toEqual(400);
      }
    });
  });

  describe("getMultipleTokensPrice", () => {
    it("should return price for multiple tokens", async () => {
      const tokensWithPrice = await squid.getMultipleTokensPrice({
        chainId: "1",
      });

      expect(tokensWithPrice.every(tokenPrice => typeof tokenPrice.usdPrice === "number")).toBe(
        true,
      );
    });
  });

  describe("getRoute", () => {
    it("should return route", async () => {
      const { route, integratorId, requestId } = await squid.getRoute({
        fromChain: "1",
        toChain: "56",
        fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        fromAddress: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
        toAddress: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
        fromAmount: "5000000000000",
        slippageConfig: {
          slippage: 1.5,
          autoMode: SlippageMode.NORMAL,
        },
      });

      expect(route.estimate).toBeDefined();
      expect(route.params).toBeDefined();
      expect(integratorId).toEqual(testIntegratorId);
      expect(requestId).toBeDefined();
    });

    it("should return 400 error if from or to address not provided", async () => {
      try {
        await squid.getRoute({
          fromChain: "1",
          toChain: "56",
          fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          fromAmount: "5000000000000",
          slippageConfig: {
            slippage: 1.5,
            autoMode: SlippageMode.NORMAL,
          },
        });
      } catch (error) {
        expect(error.response.status).toEqual(400);
      }
    });
  });
});
