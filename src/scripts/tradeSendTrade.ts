import { getSignerForChain, getTradeSendTrade } from "./utils";
import { ChainName } from "../types";
import { Squid } from "../index";
import { ethers } from "ethers";
import chalk from "chalk";

const excecuteTradeSendTrade = async (
  squid: Squid,
  signer: ethers.Wallet,
  fromNetwork: ChainName,
  toNetwork: ChainName,
  amount: string,
  isSrcNative = false,
  isDestNative = false
) => {
  const params = getTradeSendTrade(
    squid,
    fromNetwork,
    toNetwork,
    amount,
    isSrcNative,
    isDestNative
  );
  console.log("\n");
  console.log(
    `> tradeSendTrade: ${fromNetwork}=>${toNetwork} from ${
      isSrcNative ? chalk.red("Native") : chalk.green("Token")
    } ${params.fromToken} to ${
      isDestNative ? chalk.red("Native") : chalk.green("Token")
    } ${params.toToken}`
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

export const tradeSendTrade = async (
  squid: Squid,
  src: ChainName,
  dests: ChainName[],
  amount: string
) => {
  const signer = getSignerForChain(src);
  for (const dest of dests) {
    await excecuteTradeSendTrade(squid, signer, src, dest, amount);
    await excecuteTradeSendTrade(squid, signer, src, dest, amount, true);
  }
};
