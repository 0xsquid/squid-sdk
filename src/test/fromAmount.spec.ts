import { Squid, TokenData } from "../index";

let squid: Squid;

const ETHMainnet: TokenData = {
  chainId: 1,
  address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  logoURI: "",
  coingeckoId: "ethereum",
  commonKey: "weth-wei"
};

const USDCArbitrum: TokenData = {
  chainId: 42161,
  name: "USD Coin",
  address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  symbol: "USDC.e",
  decimals: 6,
  logoURI: "",
  coingeckoId: "usd-coin"
};

describe("SquidSdk approve method", () => {
  beforeAll(async () => {
    squid = new Squid({
      baseUrl: "https://api.squidrouter.com",
      integratorId: "squid-sdk-jest-run"
    });
    await squid.init();
  });

  describe("getFromAmount", () => {
    it("calculates the correct fromAmount if toAmount is very low", async () => {
      const fromAmount = await squid.getFromAmount({
        fromToken: ETHMainnet,
        toToken: USDCArbitrum,
        toAmount: "0.0001",
        slippagePercentage: 1.5
      });

      expect(Number(fromAmount)).toBeGreaterThan(0);
    });

    it("should return null if slippage is negative ", async () => {
      const fromAmount = await squid.getFromAmount({
        fromToken: ETHMainnet,
        toToken: USDCArbitrum,
        toAmount: "0.0001",
        slippagePercentage: -1
      });

      expect(fromAmount).toBe(null);
    });

    it("calculates the correct fromAmount is toAmount is high", async () => {
      const fromAmount = await squid.getFromAmount({
        fromToken: ETHMainnet,
        toToken: USDCArbitrum,
        toAmount: "1000000",
        slippagePercentage: 1.5
      });

      expect(Number(fromAmount)).toBeGreaterThan(0);
    });

    it("makes sure slippage is working", async () => {
      const lowSlippagePercentage = 0.5;
      const highSlippagePercentage = 80;

      const expectedPercentageDifference = Math.round(
        highSlippagePercentage - lowSlippagePercentage
      );

      const fromAmountLowSlippage = await squid.getFromAmount({
        fromToken: ETHMainnet,
        toToken: USDCArbitrum,
        toAmount: "10000",
        slippagePercentage: lowSlippagePercentage
      });
      const fromAmountHighSlippage = await squid.getFromAmount({
        fromToken: ETHMainnet,
        toToken: USDCArbitrum,
        toAmount: "10000",
        slippagePercentage: highSlippagePercentage
      });

      // Get the % difference between the two fromAmounts
      const percentageDifference = Math.round(
        ((Number(fromAmountHighSlippage) - Number(fromAmountLowSlippage)) /
          Number(fromAmountLowSlippage)) *
          100
      );

      // Based on USD prices, and rounded values, there could still be some differences
      const acceptThreshold = 2;

      // check how much the expected difference and the real difference are
      const differenceBetweenExpectedAndActual = Math.abs(
        expectedPercentageDifference - percentageDifference
      );

      // The expected difference and the real difference should be within the threshold
      expect(differenceBetweenExpectedAndActual).toBeLessThanOrEqual(
        acceptThreshold
      );

      expect(Number(fromAmountHighSlippage)).toBeGreaterThan(
        Number(fromAmountLowSlippage)
      );
    });
  });
});
