import { describe, expect } from "@jest/globals";
import {
  parseTransactionStatus,
  parseApiBasicResponse,
  parseStatusResponse
} from "./status";

describe("status", () => {
  const fullResponse = {
    data: {
      id: "0x340f90f07ae08285cc5bab5d9eba0802a9e3e8f96551ff4afcbc75fbee68d3fd_102_230",
      status: "destination_executed",
      gasStatus: "gas_paid_enough_gas",
      isGMPTransaction: true,
      axelarTransactionUrl:
        "https://testnet.axelarscan.io/gmp/0x340f90f07ae08285cc5bab5d9eba0802a9e3e8f96551ff4afcbc75fbee68d3fd",
      fromChain: {
        transactionId:
          "0x340f90f07ae08285cc5bab5d9eba0802a9e3e8f96551ff4afcbc75fbee68d3fd",
        blockNumber: 7887970,
        callEventStatus: "",
        callEventLog: [],
        chainData: {
          chainName: "Ethereum-2",
          chainType: "evm",
          rpc: "https://goerli.infura.io/v3/e558ada833174869b035ae269bf2d107",
          internalRpc:
            "https://goerli.infura.io/v3/e558ada833174869b035ae269bf2d107",
          networkName: "ETH Goerli Testnet",
          chainId: 5,
          nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
            icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
          },
          chainIconURI: "https://axelarscan.io/logos/chains/ethereum.svg",
          blockExplorerUrls: ["https://goerli.etherscan.io/"],
          chainNativeContracts: {
            wrappedNativeToken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
            ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
            multicall: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e",
            usdcToken: "0x254d06f33bDc5b8ee05b2ea472107E300226659A"
          },
          axelarContracts: {
            gateway: "0xBC6fcce7c5487d43830a219CA6E7B83238B41e71",
            forecallable: ""
          },
          squidContracts: {
            squidRouter: "0xC3468a191Fe51815b26535ED1F82C1f79e6Ec37D",
            defaultCrosschainToken:
              "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
            squidMulticall: "0x7555094bFFbBd7245163C3d16105031d923B1194"
          },
          estimatedRouteDuration: 900
        },
        transactionUrl:
          "https://goerli.etherscan.io/tx/0x340f90f07ae08285cc5bab5d9eba0802a9e3e8f96551ff4afcbc75fbee68d3fd"
      },
      toChain: {
        transactionId:
          "0x4b39d5597cf6d5191217bde7ed435bdf26f9ec4591b958713296c16b01bd9af5",
        blockNumber: 3116892,
        callEventStatus: "",
        callEventLog: [],
        chainData: {
          chainName: "Moonbeam",
          chainType: "evm",
          rpc: "https://rpc.api.moonbase.moonbeam.network",
          internalRpc: "https://rpc.api.moonbase.moonbeam.network",
          networkName: "Moonbase Alpha Testnet",
          chainId: 1287,
          nativeCurrency: {
            name: "Moonbeam",
            symbol: "GLMR",
            decimals: 18,
            icon: "https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985"
          },
          chainIconURI: "https://axelarscan.io/logos/chains/moonbeam.svg",
          blockExplorerUrls: ["https://moonbase.moonscan.io/"],
          chainNativeContracts: {
            wrappedNativeToken: "0x372d0695E75563D9180F8CE31c9924D7e8aaac47",
            ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
            multicall: "0x4E2cfca20580747AdBA58cd677A998f8B261Fc21",
            usdcToken: ""
          },
          axelarContracts: {
            gateway: "0x5769D84DD62a6fD969856c75c7D321b84d455929",
            forecallable: ""
          },
          squidContracts: {
            squidRouter: "0xC3468a191Fe51815b26535ED1F82C1f79e6Ec37D",
            defaultCrosschainToken:
              "0xd1633f7fb3d716643125d6415d4177bc36b7186b",
            squidMulticall: "0x7555094bFFbBd7245163C3d16105031d923B1194"
          },
          estimatedRouteDuration: 180
        },
        transactionUrl:
          "https://moonbase.moonscan.io/tx/0x4b39d5597cf6d5191217bde7ed435bdf26f9ec4591b958713296c16b01bd9af5"
      },
      errors: {}
    }
  };
  describe("parseTransactionStatus", () => {
    describe("exact match", () => {
      const selected = fullResponse.data.fromChain;
      const result = parseTransactionStatus(selected);
      it("should match provided data", () => {
        expect(result).toEqual(selected);
      });
      it("should contain transactionId", () => {
        expect(result).toHaveProperty("transactionId");
      });
      it("should contain blockNumber", () => {
        expect(result).toHaveProperty("blockNumber");
      });
      it("should contain callEventLog", () => {
        expect(result).toHaveProperty("callEventLog");
      });
      it("should contain callEventStatus", () => {
        expect(result).toHaveProperty("callEventStatus");
      });
      it("should contain transactionUrl", () => {
        expect(result).toHaveProperty("transactionUrl");
      });
    });
  });
  describe("parseApiBasicResponse", () => {
    describe("exact match", () => {
      const selected = fullResponse.data;
      const expected = {};
      const errorResponse = {
        status: 404,
        data: {
          errors: [
            {
              errorType: "NotFoundError",
              message: "No transaction found in axelarscan"
            }
          ]
        }
      };
      const result = parseApiBasicResponse(fullResponse);
      const errorResult = parseApiBasicResponse(errorResponse);
      it("should match provided data", () => {
        expect(result).toEqual(expected);
      });
      it("should contain errorType", () => {
        expect(errorResult).toHaveProperty("errorType");
      });
      it("should contain errors", () => {
        expect(errorResult).toHaveProperty("error");
      });
    });
  });
  describe("parseStatusResponse", () => {
    describe("exact match", () => {
      const selected = fullResponse;
      const result = parseStatusResponse(selected);
      it("should match provided data", () => {
        expect(result).toEqual(result);
      });
      it("should contain id", () => {
        expect(result).toHaveProperty("id");
      });
      it("should contain status", () => {
        expect(result).toHaveProperty("status");
      });
      it("should contain isGMPTransaction", () => {
        expect(result).toHaveProperty("isGMPTransaction");
      });
      it("should contain axelarTransactionUrl", () => {
        expect(result).toHaveProperty("axelarTransactionUrl");
      });
      it("should contain fromChain", () => {
        expect(result).toHaveProperty("fromChain");
      });
      it("should contain toChain", () => {
        expect(result).toHaveProperty("toChain");
      });
    });
  });
});
