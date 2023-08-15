import {
  ChainData,
  Token,
  RouteRequest,
  RouteResponse
} from "@0xsquid/squid-types";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";

import {
  EvmWallet,
  TransactionResponse,
  RpcProvider,
  Contract,
  GasData
} from "./ethers";

export type LogLevel = "info" | "error" | "debug";

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

export type OverrideParams = GasData;

export type ExecutionSettings = {
  infiniteApproval?: boolean;
};

export type CosmosSigner = SigningStargateClient;

export type ExecuteRoute = {
  signer: EvmWallet | CosmosSigner;
  route: RouteResponse["route"];
  executionSettings?: ExecutionSettings;
  overrides?: OverrideParams;
  signerAddress?: string; // cosmos specific
};

export type TransactionResponses = TransactionResponse | DeliverTxResponse;

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
