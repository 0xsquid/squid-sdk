import { ethers } from "ethers";
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
      process.env.ethereumRpcEndPoint // "https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9"
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string, // "05628be03b65c6766668898da5b419a4669aa67891bbea16718a455874bce422",
      provider
    );

    const { route } = await squid.getRoute({
      toAddress: signer.address,
      fromChain: 1,
      fromToken: squid.tokens.find(
        t => t.symbol.toLowerCase() == "usdc" && t.chainId === 1
      )?.address as string,
      fromAmount: "200000000",
      toChain: 1284,
      toToken: squid.tokens.find(
        t => t.symbol.toLowerCase() == "axlusdc" && t.chainId === 1284
      )?.address as string,
      slippage: 99
    });

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
