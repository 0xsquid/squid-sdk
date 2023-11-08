import { SigningStargateClient } from "@cosmjs/stargate";
import { ethers } from "ethers";
import { LogLevel } from "../error";

export enum ChainName {
  ACRECHAIN = "acre",
  AGORIC = "agoric",
  ARBITRUM = "Arbitrum",
  ARBITRUM2 = "arbitrum",
  ASSETMANTLE = "assetmantle",
  AURA = "aura",
  AURORA = "aurora",
  AVALANCHE = "Avalanche",
  AXELARNET = "axelarnet",
  BASE = "base",
  BINANCE = "binance",
  CARBON = "carbon",
  CELO = "celo",
  COMDEX = "comdex",
  COSMOS = "cosmoshub",
  CRESCENT = "crescent",
  EMONEY = "e-money",
  ETHEREUM = "Ethereum",
  ETHEREUM2 = "Ethereum-2",
  EVMOS = "evmos",
  FANTOM = "Fantom",
  FETCH = "fetch",
  FILECOIN = "filecoin",
  INJECTIVE = "injective",
  JUNO = "juno",
  KAVA = "kava",
  KI = "ki",
  KUJIRA = "kujira",
  MOONBEAM = "Moonbeam",
  NEUTRON = "neutron",
  OPTIMISM = "optimism",
  OSMOSIS = "osmosis",
  OSMOSIS5 = "osmosis-5",
  POLYGON = "Polygon",
  REGEN = "regen",
  SEI = "sei",
  SECRET = "secret",
  SECRETSNIP = "secret-snip",
  STARGAZE = "stargaze",
  STRIDE = "stride",
  TERRA2 = "terra-2",
  UMEE = "umee",
  XPLA = "xpla"
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
  chainIconURI: string;
  blockExplorerUrls: string[];
  estimatedRouteDuration: number;
  estimatedExpressRouteDuration: number;
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
  rpcList: string[];
};

export type ChainData = EvmChain | CosmosChain;

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
  commonKey?: string;
  bridgeOnly?: boolean;
  ibcDenom?: string;
  codeHash?: string;
};

export type Config = {
  apiKey?: string;
  baseUrl?: string;
  executionSettings?: {
    infiniteApproval?: boolean;
  };
  logging?: boolean;
  logLevel?: LogLevel;
  integratorId?: string;
};

export enum SquidCallType {
  DEFAULT = 0,
  FULL_TOKEN_BALANCE = 1,
  FULL_NATIVE_BALANCE = 2,
  COLLECT_TOKEN_BALANCE = 3
}

export type CollectFees = {
  integratorAddress: string;
  fee: number;
};

export type ContractCall = {
  callType: SquidCallType;
  target: string;
  value?: string;
  callData: string;
  payload?: {
    tokenAddress: string;
    inputPos: number;
  };
  estimatedGas: string;
};

export type CustomCosmosContractCall = {
  contract?: string;
  msg: object;
};

export type GetRoute = {
  fromChain: number | string;
  toChain: number | string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress: string;
  slippage: number;
  quoteOnly?: boolean;
  enableExpress?: boolean;
  customContractCalls?: ContractCall[] | CustomCosmosContractCall[];
  prefer?: string[];
  receiveGasOnDestination?: boolean;
  collectFees?: CollectFees;
  fallbackAddresses?: CoinTypeAddress[];
};

export type TransactionRequest = {
  routeType: string;
  targetAddress: string;
  data: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

export type OptimalRoute = {
  fromChain: Route;
  toChain: Route;
};

export type Route = Call[];

export enum CallType {
  SWAP = "SWAP",
  BRIDGE = "BRIDGE",
  CUSTOM = "CUSTOM",
  OSMOSIS_SWAP = "Swap",
  COSMOS_TRANSFER = "Transfer"
}

export type BaseCall = {
  type: CallType;
};

export type Swap = BaseCall & {
  dex: {
    chainName: string;
    dexName: string;
    factory: string;
    isStable: boolean;
    swapRouter: string;
  };
  squidCallType: SquidCallType;
  path: string[];
  fromToken: TokenData;
  toToken: TokenData;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  exchangeRate: string;
  priceImpact: string;
  dynamicSlippage?: number;
};

export type Bridge = BaseCall & {
  fromToken: TokenData;
  toToken: TokenData;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  exchangeRate: string;
  priceImpact: string;
};

export type CustomCall = BaseCall & ContractCall;

export type CosmosTransferAction = BaseCall & {
  fromChain: string;
  toChain: string;
  fromToken: TokenData;
  toToken: TokenData;
  fromChannel: string;
  toChannel: string;
};

export type SwapActionCosmosEstimate = BaseCall & {
  chainId: string;
  dex: string;
  poolId: string;
  fromToken: TokenData;
  toToken: TokenData;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  exchangeRate: string;
  priceImpact: string;
  dynamicSlippage?: number;
};

export type Call =
  | Swap
  | CustomCall
  | Bridge
  | CosmosTransferAction
  | SwapActionCosmosEstimate;

export type Estimate = {
  fromAmount: string;
  fromAmountUSD: string;
  sendAmount: string;
  toAmount: string;
  toAmountMin: string;
  toAmountUSD: string;
  route: OptimalRoute;
  exchangeRate?: string;
  estimatedRouteDuration: number;
  aggregatePriceImpact: string;
  feeCosts: FeeCost[];
  gasCosts: GasCost[];
  isExpressSupported: boolean;
};

export type RouteParams = GetRoute & {
  fromToken: TokenData;
  toToken: TokenData;
};

export type RouteData = {
  estimate: Estimate;
  transactionRequest?: TransactionRequest;
  params: GetRoute & { fromToken: TokenData; toToken: TokenData };
};

export type SdkInfoResponse = {
  chains: ChainData[];
  tokens: TokenData[];
  axelarscanURL: string;
  isInMaintenanceMode: boolean;
  maintenanceMessage?: string;
  expressDefaultDisabled: ChainName[];
};

export type RouteResponse = {
  route: RouteData;
  requestId?: string;
  integratorId?: string;
  status?: string;
  message?: string;
};

export type ChainsResponse = {
  chains: ChainData[];
};

export type TokensResponse = {
  tokens: TokenData[];
};

export type OverrideParams = Omit<
  ethers.providers.TransactionRequest,
  "to" | "data" | "value" | "from"
>;

export type ExecuteRoute = {
  signer: ethers.Wallet | ethers.Signer | SigningStargateClient;
  signerAddress?: string;
  route: RouteData;
  executionSettings?: {
    infiniteApproval?: boolean;
    setGasPrice?: boolean;
  };
  overrides?: OverrideParams;
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
  overrides?: OverrideParams;
};

export type IsRouteApproved = {
  route: RouteData;
  sender: string;
};

export type ApproveRoute = {
  route: RouteData;
  signer: ethers.Wallet | ethers.Signer;
  executionSettings?: {
    infiniteApproval?: boolean;
  };
  overrides?: OverrideParams;
};

export type RouteParamsData = {
  fromChain: ChainData;
  toChain: ChainData;
  fromToken: TokenData | undefined;
  toToken: TokenData | undefined;
  fromTokenContract: ethers.Contract | undefined;
  fromProvider: ethers.providers.JsonRpcProvider;
  fromIsNative: boolean;
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
  overrides?: OverrideParams;
};

export type GetStatus = {
  transactionId: string;
  requestId?: string;
  integratorId?: string;
  fromChainId?: string | number;
  toChainId?: string | number;
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

export type TransactionStatus = {
  transactionId: string;
  blockNumber: string;
  callEventStatus: string;
  callEventLog: Array<any>;
  chainData: ChainData;
  transactionUrl: string;
};

export type YupError = {
  path: string;
  message: string;
};

export type ApiBasicResponse = {
  error?: string | YupError[] | any;
  errorType?: string;
};

export type StatusResponse = ApiBasicResponse & {
  id?: string;
  status?: string;
  gasStatus?: string;
  isGMPTransaction?: boolean;
  axelarTransactionUrl?: string;
  fromChain?: TransactionStatus;
  toChain?: TransactionStatus;
  timeSpent?: Record<string, number>;
  requestId?: string;
  integratorId?: string;
  routeStatus?: any; //TODO add type
  squidTransactionStatus?: string;
};

export type CosmosMsg = {
  msgTypeUrl: string;
  msg: object;
};

export type WasmHookMsg = {
  wasm: {
    contract: string;
    msg: object;
  };
};

export type CoinTypeAddress = {
  coinType: number;
  address: string;
};

export const IBC_TRANSFER_TYPE = "/ibc.applications.transfer.v1.MsgTransfer";
export const WASM_TYPE = "/cosmwasm.wasm.v1.MsgExecuteContract";

export type TokenBalance = {
  symbol: string;
  address: string;
  decimals: number;
  balance: string;
  chainId: string | number;
};

export type AllBalancesResult = {
  cosmosBalances: TokenBalance[];
  evmBalances: TokenBalance[];
};

export type CosmosAddress = {
  coinType: number;
  chainId: string;
  address: string;
};

export type CosmosBalance = {
  decimals: number;
  balance: string;
  denom: string;
  chainId: string;
};
