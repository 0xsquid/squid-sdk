import { ethers } from "ethers";
import { Squid } from "./src";
import { nativeTokenConstant } from "./src/constants";

import * as dotenv from "dotenv";

dotenv.config();

const getSDK = (): Squid => {
  const squid = new Squid({
    baseUrl: "http://localhost:3000"
  });
  return squid;
};

const axlUSDC = "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC";
const USDCE = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

(async () => {
  try {
    const squid = getSDK();
    await squid.init();
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.avalanceRpcEndPoint // "https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9"
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string, // "05628be03b65c6766668898da5b419a4669aa67891bbea16718a455874bce422",
      provider
    );

    const { route } = await squid.getRoute({
      toAddress: "0xF72d63C3A6cA33bCbaEFf037F068f1dE466CCA89",
      fromChain: 43114,
      fromToken: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      fromAmount: "200000000",
      toChain: 1,
      toToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      slippage: 99,
      customContractCalls: [
        {
          callType: 1,
          target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          value: "0",
          callData:
            "0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          payload: {
            tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            inputPos: 1
          },
          estimatedGas: "400000"
        },
        {
          callType: 1,
          target: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
          value: "0",
          callData:
            "0x38ed17390000000000000000000000000000000000000000000000000000000005f5e100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000f72d63c3a6ca33bcbaeff037f068f1de466cca890000000000000000000000000000000000000000000000000000018444c14bdf0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000006b3595068778dd592e39a122f4f5a5cf09c90fe2",
          payload: {
            tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            inputPos: 0
          },
          estimatedGas: "400000"
        }
      ]
    } as any);
    console.log(
      "> route: ",
      route,
      route.estimate.route[0],
      route.estimate.route[1]
    );
    const tx = await squid.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait();
    console.log("> txReceipt: ", txReceipt);
  } catch (error: any) {
    console.error(error);
  }
})();
