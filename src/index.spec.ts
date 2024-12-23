import { Squid } from "./index";
import { isValidNumber } from "./utils/numbers";

let squid: Squid;
const testIntegratorId = "test-api";
const testBaseUrl = "https://api.uatsquidrouter.com/";

describe("Squid", () => {
  beforeAll(async () => {
    squid = new Squid({
      baseUrl: testBaseUrl,
      integratorId: testIntegratorId,
    });

    return await squid.init();
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

      expect(tokensWithPrice.every(tokenPrice => isValidNumber(tokenPrice.usdPrice))).toBe(true);
    });
  });

  describe("getRoute", () => {
    it("should return route", async () => {
      const { route, integratorId, requestId } = await squid.getRoute({
        fromChain: "1",
        toChain: "56",
        fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        fromAddress: "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
        toAddress: "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
        fromAmount: "5000000000000",
        slippage: 1.5,
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
          slippage: 1.5,
        });
      } catch (error) {
        expect(error.response.status).toEqual(400);
      }
    });
  });

  describe("getStatus", () => {
    jest.setTimeout(10000); // increase timeout for slow tests to 10 seconds

    it.skip("should return 404 error if transactionId is invalid", async () => {
      try {
        await squid.getStatus({
          requestId: "1643a99ae59c3f5164ed120812f00e38",
          integratorId: testIntegratorId,
          transactionId: "0x",
        });

        expect(true).toBe(false); // should fail before reaching here
      } catch (error) {
        expect(error.response.status).toEqual(404);
        expect(error.response.data.message).toEqual("No transaction found in axelarscan");
      }
    });

    it("should return 400 error if transactionId is missing", async () => {
      try {
        await squid.getStatus({
          requestId: "0x",
          integratorId: testIntegratorId,
          transactionId: "",
        });

        expect(true).toBe(false); // should fail before reaching here
      } catch (error) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data.message).toEqual("transactionId is a required field");
        expect(error.response.data.type).toEqual("SCHEMA_VALIDATION_ERROR");
      }
    });
  });
});
