import { ethers } from "ethers";
import { LogLevel } from "../error";
import {
  ChainName,
  RouteResponse as RouteData,
  ChainData,
  Token,
  SquidData
} from "@0xsquid/squid-types";

export type MapChainIdName = {
  [key: string | number]: ChainName;
};

export type TransactionRequest = SquidData;

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

export type GetRoute = RouteData;

export type SdkInfoResponse = {
  chains: ChainData[];
  tokens: Token[];
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
  tokens: Token[];
};

export type OverrideParams = Omit<
  ethers.providers.TransactionRequest,
  "to" | "data" | "value" | "from"
>;

export type ExecuteRoute = {
  signer: ethers.Wallet | ethers.Signer;
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
  chainId: string;
};

export type Approve = {
  signer: ethers.Wallet | ethers.Signer;
  spender: string;
  tokenAddress: string;
  amount?: string;
  chainId: string;
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
  fromToken: Token | undefined;
  toToken: Token | undefined;
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
  squidTransactionStatus?: string;
};
