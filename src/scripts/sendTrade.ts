import { getSignerForChain, getSendTrade } from "./utils";
import { ChainName } from "../types";
import SquidSdk from "../index";

export const sendTradeEthereum = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.ETHEREUM);
  const param = getSendTrade(squidSdk, ChainName.ETHEREUM, ChainName.AVALANCHE);
  console.log("\n");
  console.log(
    `> sendTrade from ethereum to avalanche from token ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  const param2 = getSendTrade(squidSdk, ChainName.ETHEREUM, ChainName.MOONBEAM);
  console.log("\n");
  console.log(
    `> sendTrade from ethereum to moonbeam from token ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  );
  const { route: route2 } = await squidSdk.getRoute(param2);
  const tx2 = await squidSdk.executeRoute({
    signer,
    route: route2
  });
  const txReceipt2 = await tx2.wait();
  console.log("> txReceipt: ", txReceipt2.transactionHash);
};

export const sendTradeAvalanche = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.AVALANCHE);
  const param = getSendTrade(squidSdk, ChainName.AVALANCHE, ChainName.ETHEREUM);
  console.log("\n");
  console.log(
    `> sendTrade from avalanche to ethereum from token ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  const param2 = getSendTrade(
    squidSdk,
    ChainName.AVALANCHE,
    ChainName.MOONBEAM
  );
  console.log("\n");
  console.log(
    `> sendTrade from avalanche to moonbeam from token ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  );
  const { route: route2 } = await squidSdk.getRoute(param2);
  const tx2 = await squidSdk.executeRoute({
    signer,
    route: route2
  });
  const txReceipt2 = await tx2.wait();
  console.log("> txReceipt: ", txReceipt2.transactionHash);
};

export const sendTradeMoonbeam = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.MOONBEAM);
  const param = getSendTrade(squidSdk, ChainName.MOONBEAM, ChainName.ETHEREUM);
  console.log("\n");
  console.log(
    `> sendTrade from moonbeam to ethereum from token ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  const param2 = getSendTrade(
    squidSdk,
    ChainName.MOONBEAM,
    ChainName.AVALANCHE
  );
  console.log("\n");
  console.log(
    `> sendTrade from moonbeam to avalanche from token ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  );
  const { route: route2 } = await squidSdk.getRoute(param2);
  const tx2 = await squidSdk.executeRoute({
    signer,
    route: route2
  });
  const txReceipt2 = await tx2.wait();
  console.log("> txReceipt: ", txReceipt2.transactionHash);
};
