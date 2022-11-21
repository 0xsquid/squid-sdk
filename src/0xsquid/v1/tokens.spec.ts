import { describe, expect } from "@jest/globals";
import { parseTokenData, parseTokenDataList } from "./tokens";

describe("tokens", () => {
  const data = {
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
    ]
  };
  describe("parseTokenData", () => {
    describe("exact match", () => {
      const selected = data.tokens[1];
      const expected = parseTokenData(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
      it("should contain chainId", () => {
        expect(expected).toHaveProperty("chainId");
      });
      it("should contain address", () => {
        expect(expected).toHaveProperty("address");
      });
      it("should contain name", () => {
        expect(expected).toHaveProperty("name");
      });
      it("should contain symbol", () => {
        expect(expected).toHaveProperty("symbol");
      });
      it("should contain decimals", () => {
        expect(expected).toHaveProperty("decimals");
      });
      it("should contain logoURI", () => {
        expect(expected).toHaveProperty("logoURI");
      });
    });
  });
  describe("parseTokenDataList", () => {
    describe("exact match", () => {
      const selected = data.tokens;
      const expected = parseTokenDataList(selected);
      it("should match provided data", () => {
        expect(expected).toEqual(selected);
      });
    });
    describe("empty tokenDataList", () => {
      const expected = parseTokenDataList([]);
      it("should be empty list", () => {
        expect(expected).toEqual([]);
      });
    });
  });
});
