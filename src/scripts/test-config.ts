import { Squid } from "../index";
//import { ethers, BigNumber } from "ethers";

export async function getTestCases(squidSdk: Squid, recipientAddress: string) {
  //constants
  const tokenAmount: string = "1"; //ethers.utils.parseEther(".1").toString(); // 0.1 WETH
  const usdc: string = "1"; //ethers.utils.parseUnits("1", 6).toString(); // 1 aUSDC
  //add test cases here

  return [
    {
      tradeType: "sendTrade: usdc on ethereum to wavax on ava",
      params: {
        recipientAddress,
        sourceChainId: squidSdk.chains.Ethereum.chainId,
        sourceTokenAddress: squidSdk.tokens.find(
          t =>
            t.symbol === "USDC" &&
            t.chainId === squidSdk.chains.Ethereum.chainId
        )!.address as string, //usdc
        sourceAmount: usdc,
        destinationChainId: squidSdk.chains.Avalanche.chainId,
        destinationTokenAddress: squidSdk.tokens.find(
          t =>
            t.symbol === "WAVAX" &&
            t.chainId === squidSdk.chains.Avalanche.chainId
        )!.address as string, //wavax
        slippage: 1
      }
    },
    {
      tradeType: "tradeSend: weth on ethereum to usdc on ava",
      params: {
        recipientAddress,
        sourceChainId: squidSdk.chains.Ethereum.chainId,
        sourceTokenAddress: squidSdk.tokens?.find(
          t =>
            t.symbol === "WETH" &&
            t.chainId === squidSdk.chains.Ethereum.chainId
        )?.address as string,
        sourceAmount: tokenAmount,
        destinationChainId: squidSdk.chains.Avalanche.chainId,
        destinationTokenAddress: squidSdk.tokens?.find(
          t =>
            t.symbol === "axlUSDC" &&
            t.chainId === squidSdk.chains.Avalanche.chainId
        )?.address as string, //wavax
        slippage: 1
      }
    },
    {
      tradeType: "tradeSend: native eth on ethereum to usdc on ava",
      params: {
        recipientAddress,
        sourceChainId: squidSdk.chains.Ethereum.chainId,
        sourceTokenAddress: squidSdk.tokens?.find(
          t =>
            t.symbol === "WETH" &&
            t.chainId === squidSdk.chains.Ethereum.chainId
        )?.address as string,
        sourceAmount: tokenAmount,
        destinationChainId: squidSdk.chains.Avalanche.chainId,
        destinationTokenAddress: squidSdk.tokens?.find(
          t =>
            t.symbol === "axlUSDC" &&
            t.chainId === squidSdk.chains.Avalanche.chainId
        )?.address as string, //wavax
        slippage: 1
      }
    },
    {
      tradeType: "tradeSendTrade: weth on ethereum to wavax on ava",
      params: {
        recipientAddress,
        sourceChainId: squidSdk.chains.Ethereum.chainId,
        sourceTokenAddress: squidSdk.tokens?.find(
          t =>
            t.symbol === "WETH" &&
            t.chainId === squidSdk.chains.Ethereum.chainId
        )?.address as string,
        sourceAmount: tokenAmount,
        destinationChainId: squidSdk.chains.Avalanche.chainId,
        destinationTokenAddress: squidSdk.tokens?.find(
          t =>
            t.symbol === "WAVAX" &&
            t.chainId === squidSdk.chains.Avalanche.chainId
        )?.address as string, //wavax
        slippage: 1
      }
    }
  ];
}
