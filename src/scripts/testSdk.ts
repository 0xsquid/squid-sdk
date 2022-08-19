import { ethers } from "ethers";
import { Environment, GetRoute, ChainName, ChainData } from "../types";
import SquidSdk from "../index";
import { assert } from "console";

const privateKey = process.env.privateKey as string;
const ethereumRpc = process.env.ethereumRpcEndPoint as string;
const avalanceRpc = process.env.avalanceRpcEndPoint as string;
const moonbeamRpc = process.env.moonbeamRpcEndPoint as string;

const getSignerForChain = (chain: ChainName) => {
  let provider;
  switch (chain) {
    case ChainName.ETHEREUM:
      provider = new ethers.providers.JsonRpcProvider(ethereumRpc);
      return new ethers.Wallet(privateKey, provider);
    case ChainName.AVALANCHE:
      provider = new ethers.providers.JsonRpcProvider(avalanceRpc);
      return new ethers.Wallet(privateKey, provider);
    case ChainName.MOONBEAM:
      provider = new ethers.providers.JsonRpcProvider(moonbeamRpc);
      return new ethers.Wallet(privateKey, provider);
    default:
      assert("Invalid Chain: ${chain}");
  }
};

const getSendTrade = (
  squid: SquidSdk,
  srcChainName: ChainName,
  destChainName: ChainName
): GetRoute => {
  const srcChain = squid.chains[srcChainName];
  const destChain = squid.chains[destChainName];

  // USDC/axlUSDC address
  const srcGatewayToken = srcChain.squidContracts.defaultCrosschainToken;
  const destGatewayToken = destChain.squidContracts.defaultCrosschainToken;
  assert(
    srcGatewayToken != destGatewayToken,
    "source and destination default cross-chain token should not be equal"
  );

  const srcSquidExecutable = srcChain.squidContracts.squidMain;
  const destSquidExecutable = destChain.squidContracts.squidMain;
  assert(
    srcSquidExecutable != destSquidExecutable,
    "source and destination squid executable address missmatch"
  );
  const recipientAddress = getSignerForChain(destChainName)?.address as string;
  const srcWrappedNative = srcChain.chainNativeContracts.wrappedNativeToken;
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

const getSDK = (env: Environment): SquidSdk => {
  const squidSdk = new SquidSdk({
    environment: env,
    baseUrl: "http://localhost:3000"
  });
  return squidSdk;
};

const buildParam = (
  srcChainId: number,
  destChainId: number,
  srcTokenAddress: string,
  sourceTokenDecimals: number,
  amountIn: string,
  destTokenAddress: string,
  recipientAddress: string
): GetRoute => {
  return {
    sourceChainId: srcChainId,
    destinationChainId: destChainId,
    sourceTokenAddress: srcTokenAddress,
    destinationTokenAddress: destTokenAddress,
    sourceAmount: ethers.utils
      .parseUnits(amountIn, sourceTokenDecimals)
      .toString(),
    recipientAddress: recipientAddress,
    slippage: 1
  } as GetRoute;
};

(async () => {
  const squidSdk = getSDK(Environment.LOCAL);
  await squidSdk.init();

  const sendTradeParam = getSendTrade(
    squidSdk,
    ChainName.ETHEREUM,
    ChainName.AVALANCHE
  );
  const { route } = await squidSdk.getRoute(sendTradeParam);
  console.log(route);
})();
