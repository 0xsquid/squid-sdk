import { Squid } from "../index";
import { ethers } from "ethers";

export async function getTestCases(squidSdk: Squid, toAddress: string) {
  //constants
  const tokenAmount = ethers.utils.parseEther(".1").toString(); // 0.1 WETH
  const usdc = ethers.utils.parseUnits("1", 6).toString(); // 1 aUSDC
  //add test cases here

  return [
    {
      tradeType: "sendTrade: usdc on ethereum to wavax on ava",
      params: {
        toAddress,
        fromChain: squidSdk.chains[0].chainId,
        fromToken: squidSdk.tokens.find(
          t => t.symbol === "USDC" && t.chainId === squidSdk.chains[0].chainId
        )!.address as string, //usdc
        fromAmount: usdc,
        toChain: squidSdk.chains[1].chainId,
        toToken: squidSdk.tokens.find(
          t => t.symbol === "WAVAX" && t.chainId === squidSdk.chains[1].chainId
        )!.address as string, //wavax
        slippage: 1
      }
    },
    {
      tradeType: "tradeSend: weth on ethereum to usdc on ava",
      params: {
        toAddress,
        fromChain: squidSdk.chains[0].chainId,
        fromToken: squidSdk.tokens?.find(
          t => t.symbol === "WETH" && t.chainId === squidSdk.chains[0].chainId
        )?.address as string,
        fromAmount: tokenAmount,
        toChain: squidSdk.chains[1].chainId,
        toToken: squidSdk.tokens?.find(
          t =>
            t.symbol === "axlUSDC" && t.chainId === squidSdk.chains[1].chainId
        )?.address as string, //wavax
        slippage: 1
      }
    },
    {
      tradeType: "tradeSend: native eth on ethereum to usdc on ava",
      params: {
        toAddress,
        fromChain: squidSdk.chains[0].chainId,
        fromToken: squidSdk.tokens?.find(
          t => t.symbol === "WETH" && t.chainId === squidSdk.chains[0].chainId
        )?.address as string,
        fromAmount: tokenAmount,
        toChain: squidSdk.chains[1].chainId,
        toToken: squidSdk.tokens?.find(
          t =>
            t.symbol === "axlUSDC" && t.chainId === squidSdk.chains[1].chainId
        )?.address as string, //wavax
        slippage: 1
      }
    },
    {
      tradeType: "tradeSendTrade: weth on ethereum to wavax on ava",
      params: {
        toAddress,
        fromChain: squidSdk.chains[0].chainId,
        fromToken: squidSdk.tokens?.find(
          t => t.symbol === "WETH" && t.chainId === squidSdk.chains[0].chainId
        )?.address as string,
        fromAmount: tokenAmount,
        toChain: squidSdk.chains[1].chainId,
        toToken: squidSdk.tokens?.find(
          t => t.symbol === "WAVAX" && t.chainId === squidSdk.chains[1].chainId
        )?.address as string, //wavax
        slippage: 1
      }
    }
  ];
}
