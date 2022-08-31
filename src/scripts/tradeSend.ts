import { getSignerForChain, getTradeSend } from "./utils";
import { ChainName } from "../types";
import { Squid } from "../index";
import { ethers } from "ethers";
import { nativeTokenConstant } from "../constants";
import chalk from "chalk";

const executeTradeSend = async (
  squid: Squid,
  signer: ethers.Wallet,
  fromNetwork: ChainName,
  toNetwork: ChainName,
  amount: string,
  isSrcNative = false
) => {
  const params = getTradeSend(
    squid,
    fromNetwork,
    toNetwork,
    amount,
    isSrcNative
  );
  console.log("\n");
  console.log(
    `> tradeSend: ${fromNetwork}=>${toNetwork} from ${
      isSrcNative ? chalk.red("Native") : chalk.green("Token")
    } ${
      isSrcNative ? nativeTokenConstant : params.sourceTokenAddress
    } to ${chalk.green("Token")} ${params.destinationTokenAddress}`
  );

  const { route } = await squid.getRoute(params);
  const tx = await squid.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log(
    `> txReceipt: , ${
      txReceipt.transactionHash
    }, gasUsed: ${txReceipt.gasUsed.toNumber()} `
  );
};

export const tradeSend = async (
  squid: Squid,
  src: ChainName,
  dests: ChainName[],
  amount: string
) => {
  const signer = getSignerForChain(src);
  for (const dest of dests) {
    await executeTradeSend(squid, signer, src, dest, amount);
    await executeTradeSend(squid, signer, src, dest, amount, true);
  }
};
