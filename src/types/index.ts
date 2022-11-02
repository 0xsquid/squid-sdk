import { ethers } from "ethers";
import { LogLevel } from "../error";

export enum ChainName {
  ALL = "all",
  ETHEREUM = "Ethereum",
  ETHEREUM2 = "Ethereum-2",
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
  POLYGON = "Polygon",
  AGORIC = "Agoric",
  ASSETMANTLE = "ASSETMANTLE",
  AXELAR = "AXELAR",
  COMDEX = "COMDEX",
  EVMOS = "EVMOS",
  KI = "KI",
  REGEN = "REGEN",
  STARGAZE = "STARGAZE",
  UMEE = "UMEE"
}

export enum ChainType {
  EVM = "evm",
  Cosmos = "cosmos"
}

export type BaseChain = {
  chainId: number | string;
  chainType: ChainType;
  chainName: ChainName;
  networkName: string;
  rpc: string;
  internalRpc: string;
  rest?: string;
  blockExplorerUrls: string[];
  estimatedRouteDuration: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
  };
  squidContracts: {
    defaultCrosschainToken: string;
    squidRouter?: string;
    squidMulticall?: string;
  };
  axelarContracts: {
    gateway: string;
    forecallable?: string;
  };
};

export type EvmChain = BaseChain & {
  chainNativeContracts: {
    wrappedNativeToken: string;
    ensRegistry: string;
    multicall: string;
    usdcToken: string;
  };
};

export type CosmosCurrency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  coingeckoId?: string;
};

export type BIP44 = {
  coinType: number;
};

export type Bech32Config = {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
};

export type CosmosGasType = {
  low: number;
  average: number;
  high: number;
};

export type CosmosChain = BaseChain & {
  rest: string;
  stakeCurrency: CosmosCurrency;
  walletUrl?: string;
  walletUrlForStaking?: string;
  bip44: BIP44;
  alternativeBIP44s?: BIP44[];
  bech32Config: Bech32Config;
  currencies: CosmosCurrency[];
  feeCurrencies: CosmosCurrency[];
  coinType?: number;
  features?: string[];
  gasPriceStep?: CosmosGasType;
  chainToAxelarChannelId: string;
};

export type ChainData = EvmChain | CosmosChain;

export type ChainsData = ChainData[];

export type MapChainIdName = {
  [key: string | number]: ChainName;
};

export type TokenData = {
  chainId: number | string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  coingeckoId: string;
};

export type Config = {
  apiKey?: string;
  baseUrl?: string;
  executionSettings?: {
    infiniteApproval?: boolean;
  };
  logging?: boolean;
  logLevel?: LogLevel;
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
  enableForecall?: boolean;
};

export type TransactionRequest = {
  routeType: string;
  targetAddress: string;
  data: string;
  value: number;
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
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
  feeCosts: FeeCost[];
  gasCosts: GasCost[];
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

export type GasCost = {
  type: string;
  token: TokenData;
  amount: string;
  amountUSD: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  estimate: string;
  limit: string;
};

export type FeeCost = {
  name: string;
  description: string;
  percentage: string;
  token: TokenData;
  amount: string;
  amountUSD: string;
};
