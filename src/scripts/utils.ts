import { ethers } from "ethers";
import * as assert from "assert";

import { Squid } from "../index";
import { GetRoute, ChainName } from "../types";
import { nativeTokenConstant } from "../constants/index";

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
  squid: Squid,
  srcChainName: ChainName,
  destChainName: ChainName,
  amount: string,
  isDestNative = false
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
  // select ether native constant for destination chain or wrapped native
  const destWrappedNative = isDestNative
    ? nativeTokenConstant
    : destChain.chainNativeContracts.wrappedNativeToken;

  //$1 axlUSDC ,swaps --> USDC/Wrapped
  const route: GetRoute = buildParam(
    srcChain.chainId,
    destChain.chainId,
    srcGatewayToken,
    6,
    amount,
    destWrappedNative,
    recipientAddress
  );
  return route;
};

export const getTradeSend = (
  squid: Squid,
  srcChainName: ChainName,
  destChainName: ChainName,
  amount: string,
  isSrcNative = false
): GetRoute => {
  const srcChain = squid.chains[srcChainName];
  const destChain = squid.chains[destChainName];

  // WRAPPED NATIVE TOKEN AS THE SOURCE (WETH/WAVAX/WGLMR)
  const srcWrapperNativeToken = isSrcNative
    ? nativeTokenConstant
    : srcChain.chainNativeContracts.wrappedNativeToken;

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
    18,
    amount, // Wrapped native
    dstCrosschainToken,
    recipientAddress
  );

  return route;
};

export const getTradeSendTrade = (
  squid: Squid,
  srcChainName: ChainName,
  destChainName: ChainName,
  amount: string,
  isSrcNative = false,
  isDestNative = false
): GetRoute => {
  const srcChain = squid.chains[srcChainName];
  const destChain = squid.chains[destChainName];

  // WRAPPED NATIVE TOKEN AS THE SOURCE (WETH/WAVAX/WGLMR)
  const srcWrapperNativeToken = isSrcNative
    ? nativeTokenConstant
    : srcChain.chainNativeContracts.wrappedNativeToken;
  // WRAPPED NATIVE TOKEN AS THE SOURCE (WETH/WAVAX/WGLMR)
  const destWrapperNativeToken = isDestNative
    ? nativeTokenConstant
    : destChain.chainNativeContracts.wrappedNativeToken;

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
    18,
    amount,
    destWrapperNativeToken,
    recipientAddress
  );

  return route;
};

export const getSendOnly = (
  squid: Squid,
  srcChainName: ChainName,
  destChainName: ChainName,
  amount: string
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

  // axlUSDC/USDC -> axlUSDC/USDC
  const route: GetRoute = buildParam(
    srcChain.chainId,
    destChain.chainId,
    srcGatewayToken,
    6,
    amount,
    destGatewayToken,
    recipientAddress
  );
  return route;
};
