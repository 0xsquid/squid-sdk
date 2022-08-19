import { getSignerForChain, getSendTrade } from "./utils";
import { ChainName } from "../types";
import SquidSdk from "../index";

export const sendTradeEthereum = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.ETHEREUM);
  const param = getSendTrade(squidSdk, ChainName.ETHEREUM, ChainName.AVALANCHE);
  console.log("> ethereum params: ", param);
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt);
};

export const sendTradeAvalance = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.AVALANCHE);
  const param = getSendTrade(squidSdk, ChainName.AVALANCHE, ChainName.ETHEREUM);
  console.log("> avalanche params: ", param);
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt);
};

export const sendTradeMoonbeam = async (squidSdk: SquidSdk) => {
  const signer = getSignerForChain(ChainName.MOONBEAM);
  const param = getSendTrade(squidSdk, ChainName.MOONBEAM, ChainName.ETHEREUM);
  console.log("> moonbeam params: ", param);
  const { route } = await squidSdk.getRoute(param);
  const tx = await squidSdk.executeRoute({
    signer,
    route
  });
  const txReceipt = await tx.wait();
  console.log("> txReceipt: ", txReceipt);
};
