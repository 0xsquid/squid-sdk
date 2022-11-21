import axios from "axios";

import { Squid } from "../index";
import { chainsData } from "./constants/chains";
import { supportedTokens } from "./constants/tokens";

jest.mock("axios");

describe("Squid", () => {
  it("should instance Squid as expected", async () => {
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
    const squidSdk = new Squid();

    expect(squidSdk).toMatchSnapshot();
    expect(squidSdk.initialized).toBe(false);
    expect(squidSdk.tokens).toEqual([]);
    expect(squidSdk.chains).toEqual([]);
  });

  describe("setConfig", () => {
    it("should set config as expected", () => {
      const squidSdk = new Squid();

      squidSdk.setConfig({
        executionSettings: {
          infiniteApproval: false
        }
      });

      expect(squidSdk.config).toStrictEqual({
        executionSettings: {
          infiniteApproval: false
        }
      });
    });
  });

  describe("axios module", () => {
    it("get", async () => {
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

      const squidSdk = new Squid();

      await squidSdk.init();
      expect(squidSdk.initialized).toEqual(true);
    });
  });
});
