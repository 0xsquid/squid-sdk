import { ethers } from "ethers";
import { Squid } from "./src";

import * as dotenv from "dotenv";
import { TransactionResponse } from "./src/types/ethers";

dotenv.config();

const getSDK = (): Squid => {
  const squid = new Squid({
    baseUrl: "http://localhost:3000",
    integratorId: "test-sdk"
  });
  return squid;
};

(async () => {
  try {
    const squid = getSDK();
    await squid.init();

    const provider = new ethers.JsonRpcProvider(
      "https://rpc.tenderly.co/fork/baac8dcb-7d97-4d7b-b41f-ab9b315b962b"
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const params = {
      toAddress: signer.address,
      fromChain: "1",
      fromToken: squid.tokens.find(
        t => t.symbol.toLowerCase() == "weth" && t.chainId === "1"
      )?.address as string,
      fromAmount: ethers.parseUnits("1", 18).toString(),
      toChain: "43114",
      toToken: squid.tokens.find(
        t => t.symbol.toLowerCase() == "axlusdc" && t.chainId === "43114"
      )?.address as string,
      slippage: 99
    };

    /* await provider.send("tenderly_setBalance", [
      [signer.address],
      "0xc9f2c9cd04674edea40000000"
    ]);

    await provider.send("tenderly_setErc20Balance", [
      // token contract address
      params.fromToken,
      // storage location balance['0xdc6bdc37b2714ee601734cf55a05625c9e512461']
      signer.address,
      // amount (at 32 bytes length)
      "0xc9f2c9cd04674edea40000000"
      /* ethers.zeroPadValue(
        ethers.toBeHex(ethers.parseUnits("1", 18).toString()),
        32
      ) 
    ]);
    */

    const { route } = await squid.getRoute(params);

    console.log("> route: ", JSON.stringify(route, null, 4));

    const tx = (await squid.executeRoute({
      signer,
      route
    })) as TransactionResponse;

    const txReceipt = await tx.wait();

    console.log("> txReceipt: ", txReceipt);
  } catch (error: any) {
    console.error(error?.response?.data || error?.message || error);
  }
})();
// 15730449741740459
// 35057691030726382
