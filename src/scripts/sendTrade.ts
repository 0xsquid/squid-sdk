import { getSignerForChain, getSendTrade } from "./utils";
import { nativeTokenConstant } from "../constants";
import { ChainName } from "../types";
import { Squid } from "../index";
import { ethers } from "ethers";
import chalk from "chalk";

const excecuteSendTrade = async (
  squid: Squid,
  signer: ethers.Wallet,
  fromNetwork: ChainName,
  toNetwork: ChainName,
  amount: string,
  isDestNative = false
) => {
  const params = getSendTrade(
    squid,
    fromNetwork,
    toNetwork,
    amount,
    isDestNative
  );
  console.log("\n");
  console.log(
    `> sendTrade: from ${fromNetwork}=>${toNetwork} from ${chalk.green(
      "Token"
    )} ${params.fromToken} to ${
      isDestNative ? chalk.red("Native") : chalk.green("Token")
    } ${isDestNative ? nativeTokenConstant : params.toToken}`
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

export const sendTrade = async (
  squid: Squid,
  src: ChainName,
  dests: ChainName[],
  amount: string
) => {
  const signer = getSignerForChain(src);
  for (const dest of dests) {
    await excecuteSendTrade(squid, signer, src, dest, amount);
    await excecuteSendTrade(squid, signer, src, dest, amount, true);
  }
};
