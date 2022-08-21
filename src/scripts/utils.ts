import { ethers } from "ethers";
import * as assert from "assert";

import SquidSdk from "../index";
import { GetRoute, ChainName } from "../types";

const buildParam = (
  sourceChainId: number,
  destinationChainId: number,
  sourceTokenAddress: string,
  sourceTokenDecimals: number,
  sourceAmount: string,
  destinationTokenAddress: string,
  recipientAddress: string
): GetRoute => {
  return {
    sourceChainId,
    destinationChainId,
    sourceTokenAddress,
    destinationTokenAddress,
    sourceAmount: ethers.utils
      .parseUnits(sourceAmount, sourceTokenDecimals)
      .toString(),
    recipientAddress,
    slippage: 1
  } as GetRoute;
};

export const getSignerForChain = (chain: ChainName): ethers.Wallet => {
  const privateKey = process.env.privateKey as string;
  const ethereumRpc = process.env.ethereumRpcEndPoint as string;
  const avalanceRpc = process.env.avalanceRpcEndPoint as string;
  const moonbeamRpc = process.env.moonbeamRpcEndPoint as string;

  assert.notEqual(ethereumRpc, undefined, ".env: ethereumRpcEndPoint missing");
  assert.notEqual(avalanceRpc, undefined, ".env: avalanceRpcEndPoint missing");
  assert.notEqual(moonbeamRpc, undefined, ".env: moonbeamRpcEndPoint missing");
  assert.notEqual(privateKey, undefined, ".env: privateKey missing");

  let provider;
  let signer;

  switch (chain) {
    case ChainName.ETHEREUM:
      provider = new ethers.providers.JsonRpcProvider(ethereumRpc);
      signer = new ethers.Wallet(privateKey, provider);
      break;
    case ChainName.AVALANCHE:
      provider = new ethers.providers.JsonRpcProvider(avalanceRpc);
      signer = new ethers.Wallet(privateKey, provider);
      break;
    case ChainName.MOONBEAM:
      provider = new ethers.providers.JsonRpcProvider(moonbeamRpc);
      signer = new ethers.Wallet(privateKey, provider);
      break;
  }

  return signer;
};

export const getSendTrade = (
  squid: SquidSdk,
  srcChainName: ChainName,
  destChainName: ChainName
): GetRoute => {
  const srcChain = squid.chains[srcChainName];
  const destChain = squid.chains[destChainName];

  // USDC/axlUSDC address
  const srcGatewayToken = srcChain.squidContracts.defaultCrosschainToken;
  const destGatewayToken = destChain.squidContracts.defaultCrosschainToken;

  assert.notEqual(
    srcGatewayToken,
    destGatewayToken,
    "source and destination default cross-chain token should not be equal"
  );

  const srcSquidExecutable = srcChain.squidContracts.squidMain;
  const destSquidExecutable = destChain.squidContracts.squidMain;

  assert.equal(
    srcSquidExecutable,
    destSquidExecutable,
    "source and destination squid executable address missmatch"
  );

  const recipientAddress = getSignerForChain(destChainName)?.address as string;
  const destWrappedNative = destChain.chainNativeContracts.wrappedNativeToken;

  //$100 axlUSDC ,swaps --> USDC/Wrapped
  const route: GetRoute = buildParam(
    srcChain.chainId,
    destChain.chainId,
    srcGatewayToken,
    6,
    "100",
    destWrappedNative,
    recipientAddress
  );

  return route;
};

export const getTradeSend = (
  squid: SquidSdk,
  srcChainName: ChainName,
  destChainName: ChainName
): GetRoute => {
  const srcChain = squid.chains[srcChainName];
  const destChain = squid.chains[destChainName];

  // WRAPPED NATIVE TOKEN AS THE SOURCE (WETH/WAVAX/WGLMR)
  const srcWrapperNativeToken =
    srcChain.chainNativeContracts.wrappedNativeToken;
  // DEFAULT CROSS CHAIN TOKEN AS THE DESTINATION (axlUSDC/USDC)
  const dstCrosschainToken = destChain.squidContracts.defaultCrosschainToken;

  const srcSquidExecutable = srcChain.squidContracts.squidMain;
  const destSquidExecutable = destChain.squidContracts.squidMain;

  assert.equal(
    srcSquidExecutable,
    destSquidExecutable,
    "source and destination squid executable address missmatch"
  );

  const recipientAddress = getSignerForChain(destChainName)?.address as string;

  // WNT swaps --> USDC/axlUSDC => axlUSDC
  const route: GetRoute = buildParam(
    srcChain.chainId,
    destChain.chainId,
    srcWrapperNativeToken,
    6,
    "1000000000000",
    dstCrosschainToken,
    recipientAddress
  );

  return route;
};

export const getTradeSendTrade = (
  squid: SquidSdk,
  srcChainName: ChainName,
  destChainName: ChainName
): GetRoute => {
  const srcChain = squid.chains[srcChainName];
  const destChain = squid.chains[destChainName];

  // WRAPPED NATIVE TOKEN AS THE SOURCE (WETH/WAVAX/WGLMR)
  const srcWrapperNativeToken =
    srcChain.chainNativeContracts.wrappedNativeToken;
  // WRAPPED NATIVE TOKEN AS THE SOURCE (WETH/WAVAX/WGLMR)
  const destWrapperNativeToken =
    destChain.chainNativeContracts.wrappedNativeToken;

  const srcSquidExecutable = srcChain.squidContracts.squidMain;
  const destSquidExecutable = destChain.squidContracts.squidMain;

  assert.equal(
    srcSquidExecutable,
    destSquidExecutable,
    "source and destination squid executable address missmatch"
  );

  const recipientAddress = getSignerForChain(destChainName)?.address as string;

  // WNT swaps --> USDC/axlUSDC => axlUSDC/USDC --> swap WNT
  const route: GetRoute = buildParam(
    srcChain.chainId,
    destChain.chainId,
    srcWrapperNativeToken,
    6,
    "1000000000000",
    destWrapperNativeToken,
    recipientAddress
  );

  return route;
};
