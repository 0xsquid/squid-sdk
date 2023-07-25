import { ethers, utils } from "ethers";
import { Squid } from "./src";

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
      process.env.ethereumRpcEndPoint
      //"https://polygon-mainnet.infura.io/v3/273aad656cd94f9aa022e4899b87dd6c"
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const { route } = (await squid.getRoute({
      toAddress: signer.address,
      fromChain: 1,
      fromToken: squid.tokens.find(
        t => t.symbol.toLowerCase() == "weth" && t.chainId === "1"
      )?.address,
      fromAmount: utils.parseUnits("1", 18).toString(),
      toChain: 137,
      toToken: squid.tokens.find(
        t => t.symbol.toLowerCase() == "matic" && t.chainId === "137"
      )?.address,
      slippage: 99
    } as any)) as any;

    console.log(JSON.stringify(route, null, 4));
    // return;
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
