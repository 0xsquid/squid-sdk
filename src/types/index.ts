import { ethers } from "ethers";

export enum ChainName {
  ETHEREUM = "Ethereum",
  AVALANCHE = "Avalanche",
  MOONBEAM = "Moonbeam"
}

export type MapChainIdName = {
  [key: number]: ChainName;
};

export type squidConfig = {
  type: string;
  chainId: number;
  gasUsage: number;
};

export type ChainData = {
  chainType: string;
  chainId: number;
  networkName: string;
  rpc: string;
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
  };
  squidConfig: squidConfig[];
  chainNativeContracts: {
    wrappedNativeToken: string;
    distributionEnsExecutable: string;
    ensRegistry: string;
    multicall: string;
  };
  axelarContracts: {
    gateway: string;
    forecallable: string;
  };
  squidContracts: {
    squidMain: string;
    defaultCrosschainToken: string;
  };
  integrationContracts: {
    dexUniswapV2: string;
    dexCurve: string;
  };
};

export type ChainsData = {
  [ChainName.ETHEREUM]: ChainData;
  [ChainName.AVALANCHE]: ChainData;
  [ChainName.MOONBEAM]: ChainData;
};

export type TokenData = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  crosschain: boolean;
  commonKey: string;
  logoURI: string;
  coingeckoId: string;
};

export type Config = {
  apiKey?: string;
  baseUrl?: string;
  executionSettings?: {
    infiniteApproval?: boolean;
  };
};

export type GetRoute = {
  sourceChainId: number;
  destinationChainId: number;
  sourceTokenAddress: string;
  destinationTokenAddress: string;
  sourceAmount: string;
  recipientAddress: string;
  slippage: number;
};

export type RouteData = {
  sourceAmount: string;
  destinationAmount: string;
  destinationAmountOutMin: string;
  exchangeRate: string;
  sourceTokenUsdPrice: number;
  destinationTokenUsdPrice: number;
};

export type TransactionRequest = {
  routeType: string;
  targetAddress: string;
  gasReceiver: boolean;
  data: string;
  destinationChainGas: number;
};

export type Route = {
  routeData: RouteData;
  transactionRequest: TransactionRequest;
  params: GetRoute;
};

export type RouteResponse = {
  route: Route;
};

export type ExecuteRoute = {
  signer: ethers.Wallet | ethers.Signer;
  route: Route;
  executionSettings?: {
    infiniteApproval?: boolean;
  };
};

export type Allowance = {
  owner: string;
  spender: string;
  tokenAddress: string;
  chainId: number;
};

export type Approve = {
  signer: ethers.Wallet | ethers.Signer;
  spender: string;
  tokenAddress: string;
  amount?: string;
  chainId: number;
};

export type IsRouteApproved = {
  route: Route;
  sender: string;
};

export type ApproveRoute = {
  route: Route;
  signer: ethers.Wallet | ethers.Signer;
};

export type RoutePopulatedData = {
  sourceChain: ChainData;
  destinationChain: ChainData;
  sourceToken: TokenData | undefined;
  destinationToken: TokenData | undefined;
  srcTokenContract: ethers.Contract | undefined;
  srcProvider: ethers.providers.JsonRpcProvider;
  sourceIsNative: boolean;
  targetAddress: string;
};

export type ValidateBalanceAndApproval = {
  srcTokenContract: ethers.Contract;
  srcProvider: ethers.providers.JsonRpcProvider;
  sourceIsNative: boolean;
  sourceAmount: string;
  targetAddress: string;
  signer: ethers.Wallet | ethers.Signer;
  sourceChain: ChainData;
  infiniteApproval?: boolean;
};

export type GetStatus = {
  transactionId: string;
  routeType: string;
  destinationAddress?: string;
  destinationChainId?: number;
  fromBlock?: number;
  toBlock?: number;
};

export type StatusResponse = {
  id: string;
  status: string;
  gasStatus: string;
  destinationTransactionId: string;
  blockNumber: number;
};
