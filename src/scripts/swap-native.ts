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
    // ETH => WAVAX | WORKING
    /* const params = {
      sourceChainId: 1,
      sourceTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      destinationChainId: 43114,
      destinationTokenAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      sourceAmount: ethers.utils.parseEther("1").toString(),
      recipientAddress: "0xF72d63C3A6cA33bCbaEFf037F068f1dE466CCA89",
      slippage: 1
    }; */

    // ETH => WGLMR | WORKING
    const params = {
      sourceChainId: 1,
      sourceTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      destinationChainId: 1284,
      destinationTokenAddress: "0xAcc15dC74880C9944775448304B263D191c6077F",
      sourceAmount: ethers.utils.parseEther("1").toString(),
      recipientAddress: "0xF72d63C3A6cA33bCbaEFf037F068f1dE466CCA89",
      slippage: 1
    };

    // AVAX => WETH | REVERTING
    /* const params = {
      sourceChainId: 43114,
      sourceTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      destinationChainId: 1,
      destinationTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      sourceAmount: ethers.utils.parseEther("1").toString(),
      recipientAddress: "0xF72d63C3A6cA33bCbaEFf037F068f1dE466CCA89",
      slippage: 1
    }; */

    const { route } = await squidSdk.getRoute(params);
    console.log("> route: ", route);
    const tx = await squidSdk.executeRoute({ signer, route });
    const txReceipt = await tx.wait();
    console.log("> txReceipt: ", txReceipt.transactionHash);
  } catch (error) {
    console.error(error);
  }
})();
