import { TokensChains } from "./TokensChains";
import { Squid } from "../index";

const tokenChains = new TokensChains();

const testIntegratorId = "test-api";
const testBaseUrl = "https://api.uatsquidrouter.com/";

describe("TokensChains", () => {
  let squid: Squid;

  beforeAll(async () => {
    squid = new Squid({
      integratorId: testIntegratorId,
      baseUrl: testBaseUrl,
    });

    await squid.init();

    tokenChains.tokens = squid.tokens;
    tokenChains.chains = squid.chains;
  });

  describe("getChainData", () => {
    it("should return chain data", async () => {
      const chain = squid.chains.find(c => c.chainId === "1");

      if (!chain) throw new Error("Chain not found");

      const chainData = tokenChains.getChainData(chain.chainId);

      expect(chainData).toEqual(chain);
    });

    it("should throw error if chain not found", async () => {
      expect(() => tokenChains.getChainData("9999999")).toThrowError()
    });
  });

  describe("getTokenData", () => {
    it("should return token data", async () => {
      const token = squid.tokens.find(t => t.symbol === "WETH" && t.chainId === "1");

      if (!token) throw new Error("Token not found");

      const tokenData = tokenChains.getTokenData(token.address, token.chainId);

      expect(tokenData).toEqual(token);
    });

    it("should throw error if token not found", async () => {
      expect(() => tokenChains.getTokenData("0x", "1")).toThrowError()
    });
  });
});
