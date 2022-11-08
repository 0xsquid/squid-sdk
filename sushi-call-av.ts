import { ethers } from "ethers";
import { Squid } from "./src";

import erc20Abi from "./src/abi/erc20.json";
import abi from "./sushiswap.json";

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

    const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const wetheToken = "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB";
    const sushiToken = "0x37B608519F91f70F2EeB0e5Ed9AF4061722e4F76";
    const usdcToken = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
    const wethToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const amount = "1000000000000000000";
    const minAmount = "0";

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ethereumRpcEndPoint
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const usdcContractInterface = new ethers.utils.Interface(erc20Abi as any);

    const approveEncodeData = usdcContractInterface.encodeFunctionData(
      "approve",
      [
        sushiRouter,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ]
    );

    console.log("> approveEncodeData: ", approveEncodeData);

    const routerContractInterface = new ethers.utils.Interface(abi as any);
    const swapEncodeData = routerContractInterface.encodeFunctionData(
      "swapExactTokensForTokens",
      [
        amount,
        minAmount,
        [usdcToken, sushiToken],
        signer.address,
        new Date().getTime() + 1e6
      ]
    );

    console.log("> swapEncodeData: ", swapEncodeData);

    const { route } = await squid.getRoute({
      toAddress: signer.address,
      fromChain: 1,
      fromToken: wethToken,
      fromAmount: amount,
      toChain: 43114,
      toToken: usdcToken,
      slippage: 99,
      customContractCalls: [
        {
          callType: 1,
          target: usdcToken,
          value: "0",
          callData: approveEncodeData,
          controllData: {
            tokenAddress: usdcToken,
            inputPos: 1
          },
          estimatedGas: "400000"
        },
        {
          callType: 1,
          target: sushiRouter,
          value: "0",
          callData: swapEncodeData,
          controllData: {
            tokenAddress: usdcToken,
            inputPos: 0
          },
          estimatedGas: "400000"
        }
      ]
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
