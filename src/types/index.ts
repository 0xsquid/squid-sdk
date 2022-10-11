import { ethers } from "ethers";

export enum ChainName {
  ETHEREUM = "Ethereum",
  OSMOSIS = "osmosis",
  OSMOSIS4 = "osmosis-4",
  MOONBEAM = "Moonbeam",
  AVALANCHE = "Avalanche",
  COSMOS = "cosmoshub",
  AXELARNET = "Axelarnet",
  KUJIRA = "kujira",
  SEI = "sei",
  FETCH = "fetch",
  CRESCENT = "crescent",
  EMONEY = "e-money",
  INJECTIVE = "injective",
  JUNO = "juno",
  SECRET = "secret",
  TERRA2 = "terra-2",
  POLYGON = "Polygon"
}

export enum ChainType {
  EVM = "evm",
  Cosmos = "cosmos"
}

export type MapChainIdName = {
  [key: string | number]: ChainName;
};

export type squidConfig = {
  type: ChainType;
  chainId: number | string;
  gasUsage: number;
};

export type ChainData = {
  chainName: ChainName;
  chainType: ChainType;
  chainId: number | string;
  networkName: string;
  rpc: string;
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
  };
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
    multicall: string;
  };
  estimatedRouteDuration: number;
};

export type ChainsData = ChainData[];

export type TokenData = {
  chainId: number | string;
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
  fromChain: number | string;
  toChain: number | string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAddress: string;
  slippage: number;
  quoteOnly?: boolean;
};

export type TransactionRequest = {
  routeType: string;
  targetAddress: string;
  gasReceiver: boolean;
  data: string;
  destinationChainGas: number;
};

export type RouteData = SwapData[];

export type SwapData = {
  dex: {
    chainName: string;
    dexName: string;
    swapRouter: string;
  };
  path: string[];
  fromToken: TokenData;
  toToken: TokenData;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
};

export type Estimate = {
  fromAmount: string;
  sendAmount: string;
  toAmount: string;
  toAmountMin: string;
  route: RouteData[];
  exchangeRate?: string;
  estimatedRouteDuration: number;
  aggregatePriceImpact: string;
};

export type Route = {
  estimate: Estimate;
  transactionRequest: TransactionRequest;
  params: GetRoute & { fromToken: TokenData; toToken: TokenData };
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
  chainId: number | string;
};

export type Approve = {
  signer: ethers.Wallet | ethers.Signer;
  spender: string;
  tokenAddress: string;
  amount?: string;
  chainId: number | string;
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
  fromChain: ChainData;
  toChain: ChainData;
  fromToken: TokenData | undefined;
  toToken: TokenData | undefined;
  fromTokenContract: ethers.Contract | undefined;
  fromProvider: ethers.providers.JsonRpcProvider;
  fromIsNative: boolean;
  targetAddress: string;
};

export type ValidateBalanceAndApproval = {
  fromTokenContract: ethers.Contract;
  fromProvider: ethers.providers.JsonRpcProvider;
  fromIsNative: boolean;
  fromAmount: string;
  targetAddress: string;
  signer: ethers.Wallet | ethers.Signer;
  fromChain: ChainData;
  infiniteApproval?: boolean;
};

export type GetStatus = {
  transactionId: string;
  routeType: string;
  destinationAddress?: string;
  toChain?: number | string;
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
