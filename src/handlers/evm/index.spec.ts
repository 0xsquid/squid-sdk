import { Squid } from "../../index";

const mockValidateNativeBalance = jest.fn().mockResolvedValue({ isApproved: true });
const mockValidateTokenBalance = jest.fn().mockResolvedValue({ isApproved: true });
const mockValidateAllowance = jest.fn().mockResolvedValue("100000000000000000");
const mockGetGasData = jest.fn().mockResolvedValue({ gasLimit: "100" });

const testIntegratorId = "test-api";
const testBaseUrl = "https://api.uatsquidrouter.com/";

jest.mock("./utils", () => ({
  Utils: class Utils {
    validateNativeBalance = mockValidateNativeBalance;
    validateTokenBalance = mockValidateTokenBalance;
    validateAllowance = mockValidateAllowance;
    getGasData = mockGetGasData;

    getTokensBalanceSupportingMultiCall =
      jest.requireActual("./utils").Utils.prototype.getTokensBalanceSupportingMultiCall;
    getTokensBalanceWithoutMultiCall =
      jest.requireActual("./utils").Utils.prototype.getTokensBalanceWithoutMultiCall;
  },
}));

jest.mock("ethers", () => ({
  ...jest.requireActual("ethers"),
  ethers: {
    ...jest.requireActual("ethers").ethers,
    Contract: class Contract {
      getEthBalance = jest.fn().mockResolvedValue("100000000000000");
      balanceOf = jest.fn().mockResolvedValue("100000000");
    },
  },
}));

const mockedSendTransaction = jest.fn();
const mockedSigner = {
  sendTransaction: mockedSendTransaction,
  address: "0x",
};

import { ExecuteRoute, RouteParamsPopulated } from "../../types";
import { EvmHandler } from "./index";

describe("EvmHandler", () => {
  beforeEach(() => {
    mockValidateNativeBalance.mockClear();
    mockValidateTokenBalance.mockClear();
    mockValidateAllowance.mockClear();
    mockGetGasData.mockClear();
    mockedSendTransaction.mockClear();
  });

  const handler = new EvmHandler();

  const data = {
    route: {
      transactionRequest: { target: "0x", value: "100", data: "0x" },
    },
    signer: mockedSigner,
  } as unknown as ExecuteRoute;
  const params = {
    fromAmount: "10000000000000000",
    fromChain: {
      chainId: "1",
    },
  } as unknown as RouteParamsPopulated;

  describe("executeRoute method", () => {
    it("should work as expected for token", async () => {
      mockedSendTransaction.mockResolvedValue({ hash: "0x" });

      const tx = await handler.executeRoute({ data, params });

      expect(mockGetGasData).toHaveBeenCalledTimes(1);
      expect(mockValidateTokenBalance).toHaveBeenCalledTimes(1);
      expect(mockValidateNativeBalance).not.toHaveBeenCalled();
      expect(mockValidateAllowance).toHaveBeenCalledTimes(1);
      expect(mockedSendTransaction).toHaveBeenCalledTimes(1);
      expect(tx).toEqual({ hash: "0x" });
    });

    it("should work as expected for native", async () => {
      mockedSendTransaction.mockResolvedValue({ hash: "0x" });

      const tx = await handler.executeRoute({
        data,
        params: { ...params, fromIsNative: true } as any,
      });

      expect(mockGetGasData).toHaveBeenCalledTimes(1);
      expect(mockValidateNativeBalance).toHaveBeenCalledTimes(1);
      expect(mockValidateAllowance).not.toHaveBeenCalled();
      expect(mockedSendTransaction).toHaveBeenCalledTimes(1);
      expect(tx).toEqual({ hash: "0x" });
    });
  });

  describe("approveRoute", () => {
    it("", () => {
      // expect();
    });
  });

  describe("getBalances", () => {
    let squid: Squid;

    beforeAll(() => {
      squid = new Squid({
        integratorId: testIntegratorId,
        baseUrl: testBaseUrl,
      });

      return squid.init();
    });

    it("returns balances for native tokens", async () => {
      const ethToken = squid.tokens.find(t => t.symbol === "ETH" && t.chainId === "1");
      const avaxToken = squid.tokens.find(t => t.symbol === "AVAX" && t.chainId === "43114");
      const ethereumChain = squid.chains.find(c => c.chainId === "1");
      const avalancheChain = squid.chains.find(c => c.chainId === "43114");

      if (!ethToken || !avaxToken) throw new Error("Tokens not found");
      if (!ethereumChain || !avalancheChain) throw new Error("Chain not found");

      const balances = await handler.getBalances(
        [ethToken, avaxToken],
        "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
        {
          "1": ethereumChain.rpc,
          "43114": avalancheChain.rpc,
        },
      );

      expect(balances).toEqual([
        {
          symbol: ethToken.symbol,
          address: ethToken.address,
          decimals: ethToken.decimals,
          chainId: ethToken.chainId,
          balance: "100000000000000",
        },
        {
          symbol: avaxToken.symbol,
          address: avaxToken.address,
          decimals: avaxToken.decimals,
          chainId: avaxToken.chainId,
          balance: "100000000000000",
        },
      ]);
    });

    it("returns balances for non-native tokens", async () => {
      const usdcToken = squid.tokens.find(t => t.symbol === "USDC" && t.chainId === "42161");
      const wethToken = squid.tokens.find(t => t.symbol === "WETH" && t.chainId === "137");
      const polygonChain = squid.chains.find(c => c.chainId === "137");
      const arbitrumChain = squid.chains.find(c => c.chainId === "42161");

      if (!usdcToken || !wethToken) throw new Error("Tokens not found");
      if (!polygonChain || !arbitrumChain) throw new Error("Chains not found");

      const balances = await handler.getBalances(
        [usdcToken, wethToken],
        "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
        {
          "137": polygonChain.rpc,
          "42161": arbitrumChain.rpc,
        },
      );

      expect(balances).toEqual([
        {
          symbol: wethToken.symbol,
          address: wethToken.address,
          decimals: wethToken.decimals,
          chainId: wethToken.chainId,
          balance: "100000000",
        },
        {
          symbol: usdcToken.symbol,
          address: usdcToken.address,
          decimals: usdcToken.decimals,
          chainId: usdcToken.chainId,
          balance: "100000000",
        },
      ]);
    });
  });
});
