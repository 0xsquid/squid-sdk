import { ChainData, SquidData } from "@0xsquid/squid-types";
import { Contract, RpcProvider } from "../../types/ethers";
import { Utils } from "./utils";

const mockedGetBalance = jest.fn();
const mockedProvider = {
  getBalance: mockedGetBalance
} as unknown as RpcProvider;

const mockedBalanceOf = jest.fn();
const mockedAllowance = jest.fn();
const mockedContract = {
  balanceOf: mockedBalanceOf,
  allowance: mockedAllowance,
  symbol: jest.fn().mockResolvedValue("weth")
} as unknown as Contract;

describe("ethers Utils", () => {
  const utils = new Utils();
  const sender = "0xD8005E8eDf656F8c9ee82287390B5A1eD8614211";
  const router = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";
  const amount = BigInt("100000000000000000");
  const fromChain = {
    chainId: "1",
    nativeCurrency: {
      symbol: "eth"
    }
  } as ChainData;

  beforeEach(() => {
    mockedGetBalance.mockClear();
    mockedBalanceOf.mockClear();
  });

  describe("validateNativeBalance method", () => {
    it("should return true if balance > amount", async () => {
      mockedGetBalance.mockResolvedValueOnce("100000000000000001");

      const result = await utils.validateNativeBalance({
        fromProvider: mockedProvider,
        sender: sender,
        amount: amount,
        fromChain: fromChain
      });

      expect(mockedGetBalance).toHaveBeenCalledWith(sender);
      expect(result.isApproved).toBeTruthy();
    });

    it("should throw an error if balance < amount", async () => {
      mockedGetBalance.mockResolvedValueOnce("1000000000000000");

      try {
        await utils.validateNativeBalance({
          fromProvider: mockedProvider,
          sender: sender,
          amount: amount,
          fromChain: fromChain
        });
      } catch (error: any) {
        expect(mockedGetBalance).toHaveBeenCalledWith(sender);
        expect(error.message).toBe(
          `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`
        );
      }
    });
  });

  describe("validateTokenBalance method", () => {
    it("should return true if balance > amount", async () => {
      mockedBalanceOf.mockResolvedValueOnce("100000000000000001");

      const result = await utils.validateTokenBalance({
        fromTokenContract: mockedContract,
        sender: sender,
        amount: amount,
        fromChain: fromChain
      });

      expect(mockedBalanceOf).toHaveBeenCalledWith(sender);
      expect(result.isApproved).toBeTruthy();
    });

    it("should throw an error if balance < amount", async () => {
      mockedBalanceOf.mockResolvedValueOnce("1000000000000000");

      try {
        await utils.validateTokenBalance({
          fromTokenContract: mockedContract,
          sender: sender,
          amount: amount,
          fromChain: fromChain
        });
      } catch (error: any) {
        expect(mockedBalanceOf).toHaveBeenCalledWith(sender);
        expect(error.message).toBe(
          `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`
        );
      }
    });
  });

  describe("validateAllowance method", () => {
    it("should return true if allowance > amount", async () => {
      mockedAllowance.mockResolvedValueOnce("100000000000000001");

      const hasAllowance = await utils.validateAllowance({
        fromTokenContract: mockedContract,
        sender: sender,
        amount: amount,
        router: router
      });

      expect(mockedAllowance).toHaveBeenCalledWith(sender, router);
      expect(hasAllowance).toBeTruthy();
    });

    it("should return false if allowance < amount", async () => {
      mockedAllowance.mockResolvedValueOnce("1000000000000000");

      const hasAllowance = await utils.validateAllowance({
        fromTokenContract: mockedContract,
        sender: sender,
        amount: amount,
        router: router
      });

      expect(mockedAllowance).toHaveBeenCalledWith(sender, router);
      expect(hasAllowance).toBeFalsy();
    });
  });

  describe("getGasData", () => {
    const mockedTransactionRequest = {
      gasLimit: "1",
      gasPrice: "2",
      maxPriorityFeePerGas: "3",
      maxFeePerGas: "4"
    } as SquidData;

    it("should return gas data without gas price", () => {
      const gasData = utils.getGasData({
        transactionRequest: mockedTransactionRequest
      });

      expect(gasData).toEqual({
        gasLimit: gasData.gasLimit,
        maxPriorityFeePerGas: gasData.maxPriorityFeePerGas,
        maxFeePerGas: gasData.maxFeePerGas
      });
    });

    it("should return gas data with gas price", () => {
      const gasData = utils.getGasData({
        transactionRequest: {
          gasLimit: mockedTransactionRequest.gasLimit,
          gasPrice: mockedTransactionRequest.gasPrice
        } as SquidData
      });

      expect(gasData).toEqual({
        gasLimit: gasData.gasLimit,
        gasPrice: gasData.gasPrice
      });
    });

    it("should return gas data with overrides params", () => {
      const gasData = utils.getGasData({
        transactionRequest: mockedTransactionRequest,
        overrides: {
          maxPriorityFeePerGas: "33"
        }
      });

      expect(gasData).toEqual({
        gasLimit: gasData.gasLimit,
        maxPriorityFeePerGas: "33",
        maxFeePerGas: gasData.maxFeePerGas
      });
    });
  });
});
