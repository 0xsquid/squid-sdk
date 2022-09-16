import axios from "axios";

import { Squid } from "../index";

jest.mock("axios");

describe("Squid", () => {
  it("should instance Squid as expected", async () => {
    const axiosInstance = (axios.create as jest.Mock).mockReturnValue({
      get: jest.fn()
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
      const axiosInstance = (axios.create as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { status: true, data: { chains: [] }, tokens: [] }
        })
      });

      const squidSdk = new Squid();

      await squidSdk.init();
      expect(squidSdk.initialized).toEqual(true);
    });
  });
});
