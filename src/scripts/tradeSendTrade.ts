import { getSignerForChain, getTradeSendTrade } from "./utils";
import { ChainName } from "../types";
import SquidSdk from "../index";

export const tradeSendTradeEthereum = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.ETHEREUM);
  const param = getTradeSendTrade(
    squidSdk,
    ChainName.ETHEREUM,
    ChainName.MOONBEAM
  );
  console.log("\n");
  console.log(
    `> tradeSendTrade from ethereum to moonbeam ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  // TODO: REVIEW WHY THIS IS FAILING
  // const param2 = getTradeSendTrade(
  //   squidSdk,
  //   ChainName.ETHEREUM,
  //   ChainName.AVALANCHE
  // );
  // console.log("\n");
  // console.log(
  //   `> tradeSendTrade from ethereum to avalance ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  // );
  // const { route: route2 } = await squidSdk.getRoute(param2);
  // const tx2 = await squidSdk.executeRoute({
  //   signer,
  //   route: route2
  // });
  // const txReceipt2 = await tx2.wait();
  // console.log("> txReceipt: ", txReceipt2.transactionHash);
};

export const tradeSendTradeAvalance = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.AVALANCHE);
  const param = getTradeSendTrade(
    squidSdk,
    ChainName.AVALANCHE,
    ChainName.ETHEREUM
  );
  console.log("\n");
  console.log(
    `> tradeSendTrade from avalanche to ethereum ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  // TODO: REVIEW WHY THIS IS FAILING
  // const param2 = getTradeSendTrade(
  //   squidSdk,
  //   ChainName.AVALANCHE,
  //   ChainName.MOONBEAM
  // );
  // console.log("\n");
  // console.log(
  //   `> tradeSendTrade from avalance to moonbeam ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  // );
  // const { route: route2 } = await squidSdk.getRoute(param2);
  // const tx2 = await squidSdk.executeRoute({
  //   signer,
  //   route: route2
  // });
  // const txReceipt2 = await tx2.wait();
  // console.log("> txReceipt: ", txReceipt2.transactionHash);
};

export const tradeSendTradeMoonbeam = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.MOONBEAM);
  const param = getTradeSendTrade(
    squidSdk,
    ChainName.MOONBEAM,
    ChainName.ETHEREUM
  );
  console.log("\n");
  console.log(
    `> tradeSendTrade from moonbeam to ethereum ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  // TODO: REVIEW WHY THIS IS FAILING
  // const param2 = getTradeSendTrade(
  //   squidSdk,
  //   ChainName.MOONBEAM,
  //   ChainName.AVALANCHE
  // );
  // console.log("\n");
  // console.log(
  //   `> tradeSendTrade from moonbeam to avalanche ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  // );
  // const { route: route2 } = await squidSdk.getRoute(param2);
  // const tx2 = await squidSdk.executeRoute({
  //   signer,
  //   route: route2
  // });
  // const txReceipt2 = await tx2.wait();
  // console.log("> txReceipt: ", txReceipt2.transactionHash);
};
