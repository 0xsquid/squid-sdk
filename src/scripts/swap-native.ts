import * as dotenv from "dotenv";

import { Environment } from "../types";
import { Squid } from "../index";
import { ethers } from "ethers";

dotenv.config();

const getSDK = (env: Environment): Squid => {
  const squidSdk = new Squid({
    environment: env,
    baseUrl: "http://localhost:3000"
  });
  return squidSdk;
};

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ethereumRpcEndPoint
  );
  const signer = new ethers.Wallet(process.env.privateKey as string, provider);

  const squidSdk = getSDK(Environment.LOCAL);
  await squidSdk.init();

  try {
    const params = {
      sourceChainId: 1,
      sourceTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      destinationChainId: 43114,
      destinationTokenAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      sourceAmount: ethers.utils.parseEther("1").toString(),
      recipientAddress: "0xF72d63C3A6cA33bCbaEFf037F068f1dE466CCA89",
      slippage: 1
    };

    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({ signer, route });
    const txReceipt = await tx.wait();

    console.log("> txReceipt: ", txReceipt.transactionHash);
  } catch (error) {
    console.error(error);
  }
})();
