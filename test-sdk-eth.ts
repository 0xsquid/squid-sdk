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

(async () => {
  try {
    const squid = getSDK();
    await squid.init();
    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:8500/0" // "https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9"
    );
    const signer = new ethers.Wallet(
      "0x6db76b64b8019ea6d646ee8b70a9e4f7c3aa0f943b42eb700d4a798b3544a094" as string, // "05628be03b65c6766668898da5b419a4669aa67891bbea16718a455874bce422",
      provider
    );

    const { route } = await squid.getRoute({
      toAddress: "0xF72d63C3A6cA33bCbaEFf037F068f1dE466CCA89",
      fromChain: 1,
      fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      fromAmount: "150000000",
      toChain: 137,
      toToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      slippage: 99
      /* endContractCall: [
        {
          callType: 1,
          target: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
          value: "0",
          callData: "0x",
          controllData: {
            tokenAddress: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
            inputPos: 0
          },
          estimatedGas: "400000"
        }
      ] */
    } as any);
    console.log("> route: ", JSON.stringify(route, null, 4));
    const tx = await squid.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait();
    console.log("> txReceipt: ", txReceipt);
  } catch (error) {
    console.error(error);
  }
})();
