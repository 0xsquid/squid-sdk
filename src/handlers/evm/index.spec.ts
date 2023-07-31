const mockValidateNativeBalance = jest
  .fn()
  .mockResolvedValue({ isApproved: true });
const mockValidateTokenBalance = jest
  .fn()
  .mockResolvedValue({ isApproved: true });
const mockValidateAllowance = jest.fn().mockResolvedValue("100000000000000000");
const mockGetGasData = jest.fn().mockResolvedValue({ gasLimit: "100" });

jest.mock("./utils", () => ({
  Utils: class Utils {
    validateNativeBalance = mockValidateNativeBalance;
    validateTokenBalance = mockValidateTokenBalance;
    validateAllowance = mockValidateAllowance;
    getGasData = mockGetGasData;
  }
}));

const mockedSendTransaction = jest.fn();
const mockedSigner = {
  sendTransaction: mockedSendTransaction,
  address: "0x"
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
      transactionRequest: { target: "0x", value: "100", data: "0x" }
    },
    signer: mockedSigner
  } as unknown as ExecuteRoute;
  const params = {
    fromAmount: "10000000000000000"
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
        params: { ...params, fromIsNative: true } as any
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
});
