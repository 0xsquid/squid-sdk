import { getSignerForChain, getTradeSend } from "./utils";
import { ChainName } from "../types";
import SquidSdk from "../index";

export const tradeSendEthereum = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.ETHEREUM);
  const param = getTradeSend(squidSdk, ChainName.ETHEREUM, ChainName.MOONBEAM);
  console.log("\n");
  console.log("> tradeSend from ethereum to moonbeam params: ", param);
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);
};

export const tradeSendAvalance = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.AVALANCHE);
  const param = getTradeSend(squidSdk, ChainName.AVALANCHE, ChainName.ETHEREUM);
  console.log("\n");
  console.log("> tradeSend from avalanche to ethereum params: ", param);
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);
};

export const tradeSendMoonbeam = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.MOONBEAM);
  const param = getTradeSend(squidSdk, ChainName.MOONBEAM, ChainName.ETHEREUM);
  console.log("\n");
  console.log("> tradeSend from moonbeam to ethereum params: ", param);
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);
};
