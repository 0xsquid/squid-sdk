import axios from "axios";

import { Environment } from "../types";
import Squid from "../index";

jest.mock("axios");

describe("Squid", () => {
  it("should instance Squid as expected", async () => {
    const axiosInstance = (axios.create as jest.Mock).mockReturnValue({
      get: jest.fn()
    });
    const squidSdk = new Squid({
      environment: Environment.LOCAL
    });

    expect(squidSdk).toMatchSnapshot();
    expect(squidSdk.inited).toBe(false);
    expect(squidSdk.config).toStrictEqual({
      environment: Environment.LOCAL
    });
    expect(squidSdk.tokens).toEqual([]);
    expect(squidSdk.chains).toEqual({});
  });

  describe("setConfig", () => {
    it("should set config as expected", () => {
      const squidSdk = new Squid({
        environment: Environment.LOCAL
      });

      squidSdk.setConfig({
        environment: Environment.TESTNET,
        executionSettings: {
          infiniteApproval: false
        }
      });

      expect(squidSdk.config).not.toStrictEqual({
        environment: Environment.LOCAL
      });
      expect(squidSdk.config).toStrictEqual({
        environment: Environment.TESTNET,
        executionSettings: {
          infiniteApproval: false
        }
      });
    });
  });

  describe("axios module", () => {
    it("get", async () => {
      const axiosInstance = (axios.create as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { status: true, data: { chains: {} }, tokens: [] }
        })
      });

      const squidSdk = new Squid({
        environment: Environment.LOCAL
      });

      await squidSdk.init();
      expect(squidSdk.inited).toEqual(true);

      console.log("> squidsdk: ", squidSdk.chains);
    });
  });
});
