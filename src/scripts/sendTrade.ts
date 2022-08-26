import { getSignerForChain, getSendTrade } from "./utils";
import { ChainName } from "../types";
import { Squid } from "../index";
import { ethers } from "ethers";

const excecuteSendTrade = async (
  squid: Squid,
  signer: ethers.Wallet,
  fromNetwork: ChainName,
  toNetwork: ChainName,
  amount: string,
  isDestNative = false
) => {
  const param = getSendTrade(squid, fromNetwork, toNetwork, amount);
  console.log("\n");
  console.log(
    `> sendTrade: from ${fromNetwork}=>${toNetwork} from Token ${
      param.sourceTokenAddress
    } to ${isDestNative ? "Native" : "Token"} ${param.destinationTokenAddress}`
  );
  const { route } = await squid.getRoute(param);
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
