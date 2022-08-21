import axios from "axios";

import { Environment } from "../types";
import SquidSdk from "../index";
import { assert } from "console";

jest.mock("axios");

// const axiosInstance = (axios.create as jest.Mock).mockReturnValue({
//   get: jest.fn()
// })

describe("SquidSdk", () => {
  it("should instance SquidSdk as expected", async () => {
    const squidSdk = new SquidSdk({
      environment: Environment.LOCAL
    });

    expect(squidSdk).toMatchSnapshot();
    expect(squidSdk.inited).toBe(false);
    expect(squidSdk.config).toStrictEqual({
      environment: Environment.LOCAL
    });
    expect(squidSdk.tokens).toEqual({});
    expect(squidSdk.chains).toEqual({});
  });

  describe("setConfig", () => {
    it("should set config as expected", () => {
      const squidSdk = new SquidSdk({
        environment: Environment.LOCAL
      });

      squidSdk.setConfig({
        environment: Environment.TESTNET
      });

      expect(squidSdk.config).not.toStrictEqual({
        environment: Environment.LOCAL
      });
      expect(squidSdk.config).toStrictEqual({
        environment: Environment.TESTNET
      });
    });
  });

  describe("axios module", () => {
    it("get", async () => {
      const axiosInstance = (axios.create as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { status: true, data: { chains: [], tokens: [] } }
        })
      });

      const squidSdk = new SquidSdk({
        environment: Environment.LOCAL
      });

      await squidSdk.init();
      expect(squidSdk.inited).toEqual(true);

      console.log("> squidsdk: ", squidSdk.chains);
    });
  });
});
