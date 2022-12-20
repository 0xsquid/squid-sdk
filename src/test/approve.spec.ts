import axios from "axios";
import { ethers } from "ethers";

import { Squid } from "../index";

import { chainsData } from "./constants/chains";
import { supportedTokens } from "./constants/tokens";
import { uint256MaxValue } from "../constants";

jest.mock("axios");
jest.mock("ethers");

describe("SquidSdk approve method", () => {
  const getMocked = jest.fn().mockResolvedValue({
    data: {
      chains: chainsData,
      tokens: supportedTokens
    },
    status: 200
  });
  const mockedAxios = (axios.create as jest.Mock).mockReturnValue({
    get: getMocked,
    interceptors: {
      response: {
        use: jest.fn()
      }
    }
  });

  const mockedApprove = jest.fn().mockResolvedValue({});
  const mockedContract = jest.fn().mockReturnValue({
    approve: mockedApprove
  });
  const mockedEthers = (
    ethers.Contract as unknown as jest.Mock
  ).mockImplementation(mockedContract);

  it("should call the approve method with infinite amount", async () => {
    const squidSdk = new Squid();

    await squidSdk.init();

    const approval = await squidSdk.approve({
      signer: {} as ethers.Wallet,
      spender: "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      chainId: 1
    });

    expect(mockedApprove).toHaveBeenCalledWith(
      "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      uint256MaxValue,
      undefined
    );
    expect(approval).toStrictEqual({});
  });

  it("should call the approve method with amount", async () => {
    const squidSdk = new Squid();

    await squidSdk.init();

    const approval = await squidSdk.approve({
      signer: {} as ethers.Wallet,
      spender: "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      chainId: 1,
      amount: "100"
    });

    expect(mockedApprove).toHaveBeenCalledWith(
      "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      "100",
      undefined
    );
    expect(approval).toStrictEqual({});
  });
});
