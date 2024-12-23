import {
  RouteResponse as _RouteResponse,
  ChainData,
  DepositAddressResponse,
  RouteRequest,
  Token,
} from "@0xsquid/squid-types";
import { SigningStargateClient } from "@cosmjs/stargate";

import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Contract, EvmWallet, GasData, RpcProvider, TransactionResponse } from "./ethers";

export * from "@0xsquid/squid-types";
export * from "./cosmos";
export * from "./ethers";
export * from "./http";

export type LogLevel = "info" | "error" | "debug";

export type Config = {
  apiKey?: string;
  baseUrl?: string;
  executionSettings?: {
    infiniteApproval?: boolean;
  };
  logging?: boolean;
  logLevel?: LogLevel;
  integratorId: string;
  timeout?: number;
};

export type OverrideParams = GasData;

export type ExecutionSettings = {
  infiniteApproval?: boolean;
  approvalWaitMs?: number;
};

export type CosmosSigner = SigningStargateClient;

export type ExecuteRoute = {
  signer: EvmWallet | CosmosSigner;
  route: _RouteResponse["route"];
  executionSettings?: ExecutionSettings;
  overrides?: OverrideParams;
  bypassBalanceChecks?: boolean;
  signerAddress?: string; // cosmos specific
};

export type RouteResponse = _RouteResponse & {
  requestId?: string;
  integratorId?: string;
};

export type TransactionResponses = TransactionResponse | TxRaw | DepositAddressResponse;

export type GetStatus = {
  transactionId: string;
  requestId?: string;
  integratorId?: string;
};

export type RouteParamsPopulated = Omit<
  RouteRequest,
  "fromChain" | "toChain" | "fromToken" | "toToken"
> & {
  fromChain: ChainData;
  toChain: ChainData;
  fromToken: Token;
  toToken: Token;
  fromTokenContract: Contract | undefined;
  fromProvider: RpcProvider;
  fromIsNative: boolean;
};

// TO BE REMOVED AFTER V2 STATUS API IS DONE
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
// END STATUS TYPE

export type TokenBalance = {
  symbol: string;
  address: string;
  decimals: number;
  balance: string;
  chainId: string | number;
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
