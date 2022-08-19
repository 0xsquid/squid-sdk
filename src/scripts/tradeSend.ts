import { getSignerForChain, getTradeSend } from "./utils";
import { ChainName } from "../types";
import SquidSdk from "../index";

export const tradeSendEthereum = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.ETHEREUM);
  const param = getTradeSend(squidSdk, ChainName.ETHEREUM, ChainName.MOONBEAM);
  console.log("\n");
  console.log(
    `> tradeSend from ethereum to moonbeam ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  const param2 = getTradeSend(
    squidSdk,
    ChainName.ETHEREUM,
    ChainName.AVALANCHE
  );
  console.log("\n");
  console.log(
    `> tradeSend from ethereum to avalance ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  );
  const { route: route2 } = await squidSdk.getRoute(param2);
  const tx2 = await squidSdk.executeRoute({
    signer,
    route: route2
  });
  const txReceipt2 = await tx2.wait();
  console.log("> txReceipt: ", txReceipt2.transactionHash);
};

export const tradeSendAvalance = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.AVALANCHE);
  const param = getTradeSend(squidSdk, ChainName.AVALANCHE, ChainName.ETHEREUM);
  console.log("\n");
  console.log(
    `> tradeSend from avalanche to ethereum ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  const param2 = getTradeSend(
    squidSdk,
    ChainName.AVALANCHE,
    ChainName.MOONBEAM
  );
  console.log("\n");
  console.log(
    `> tradeSend from avalance to moonbeam ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  );
  const { route: route2 } = await squidSdk.getRoute(param2);
  const tx2 = await squidSdk.executeRoute({
    signer,
    route: route2
  });
  const txReceipt2 = await tx2.wait();
  console.log("> txReceipt: ", txReceipt2.transactionHash);
};

export const tradeSendMoonbeam = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.MOONBEAM);
  const param = getTradeSend(squidSdk, ChainName.MOONBEAM, ChainName.ETHEREUM);
  console.log("\n");
  console.log(
    `> tradeSend from moonbeam to ethereum ${param.sourceTokenAddress} to ${param.destinationTokenAddress}`
  );
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt.transactionHash);

  const param2 = getTradeSend(
    squidSdk,
    ChainName.MOONBEAM,
    ChainName.AVALANCHE
  );
  console.log("\n");
  console.log(
    `> tradeSend from moonbeam to avalanche ${param2.sourceTokenAddress} to ${param2.destinationTokenAddress}`
  );
  const { route: route2 } = await squidSdk.getRoute(param2);
  const tx2 = await squidSdk.executeRoute({
    signer,
    route: route2
  });
  const txReceipt2 = await tx2.wait();
  console.log("> txReceipt: ", txReceipt2.transactionHash);
};
