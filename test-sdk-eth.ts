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
      process.env.ethereumRpcEndPoint // "https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9"
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string, // "05628be03b65c6766668898da5b419a4669aa67891bbea16718a455874bce422",
      provider
    );

    const { route } = await squid.getRoute({
      sourceChainId: "1",
      sourceTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      destinationChainId: "43114",
      destinationTokenAddress: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      sourceAmount: "1000000000000000000",
      recipientAddress: signer.address,
      slippage: 10
    });
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
