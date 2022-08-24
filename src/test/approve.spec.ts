import axios from "axios";
import { ethers } from "ethers";

import { Environment } from "../types";
import { Squid } from "../index";

import { chainsData } from "./constants/chains";
import { supportedTokens } from "./constants/tokens";
import { uint256MaxValue } from "../contants/infiniteApproval";

jest.mock("axios");
jest.mock("ethers");

describe("SquidSdk approve method", () => {
  const getMocked = jest.fn().mockResolvedValue({
    data: {
      status: true,
      data: { chains: chainsData, tokens: supportedTokens }
    }
  });
  const mockedAxios = (axios.create as jest.Mock).mockReturnValue({
    get: getMocked
  });

  const mockedApprove = jest.fn().mockResolvedValue({});
  const mockedContract = jest.fn().mockReturnValue({
    approve: mockedApprove
  });
  const mockedEthers = (
    ethers.Contract as unknown as jest.Mock
  ).mockImplementation(mockedContract);

  it("should call the approve method with infinite amount", async () => {
    const squidSdk = new Squid({
      environment: Environment.LOCAL
    });

    await squidSdk.init();

    const approval = await squidSdk.approve({
      signer: {} as ethers.Wallet,
      spender: "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    });

    expect(mockedApprove).toHaveBeenCalledWith(
      "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      uint256MaxValue
    );
    expect(approval).toStrictEqual({});
  });

  it("should call the approve method with amount", async () => {
    const squidSdk = new Squid({
      environment: Environment.LOCAL
    });

    await squidSdk.init();

    const approval = await squidSdk.approve({
      signer: {} as ethers.Wallet,
      spender: "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: "100"
    });

    expect(mockedApprove).toHaveBeenCalledWith(
      "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
      "100"
    );
    expect(approval).toStrictEqual({});
  });
});
