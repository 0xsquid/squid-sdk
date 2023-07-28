import {
  ChainData,
  Token,
  SquidData,
  RouteRequest,
  Estimate
} from "@0xsquid/squid-types";
import { ethers } from "ethers";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";

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

export type RouteData = {
  estimate: Estimate;
  transactionRequest: SquidData;
  params: RouteRequest;
};

export type OverrideParams = Omit<
  ethers.providers.TransactionRequest,
  "to" | "data" | "value" | "from"
>;

export type ExecutionSettings = {
  infiniteApproval?: boolean;
};

export type EvmSigner = ethers.Wallet | ethers.Signer;
export type CosmosSigner = SigningStargateClient;

export type ExecuteRoute = {
  signer: EvmSigner | CosmosSigner;
  route: RouteData;
  executionSettings?: ExecutionSettings;
  overrides?: OverrideParams;
  signerAddress?: string; // cosmos specific
};

export type TransactionResponse =
  | ethers.providers.TransactionResponse
  | DeliverTxResponse;

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
  fromTokenContract: ethers.Contract | undefined;
  fromProvider: ethers.providers.JsonRpcProvider;
  fromIsNative: boolean;
};
