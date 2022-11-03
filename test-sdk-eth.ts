import { ethers } from "ethers";
import { Squid } from "./src";
import { nativeTokenConstant } from "./src/constants";

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
      fromAmount: "15000000",
      toChain: 1284,
      toToken: "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9",
      slippage: 99,
      endContractCall: [
        {
          callType: "",
          target: "",
          value: "",
          callData: "",
          controllData: {
            tokenAddress: "",
            inputPos: 6
          },
          estimatedGas: ""
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
  } catch (error) {
    console.error(error);
  }
})();
