import {
  ChainData,
  Token,
  SquidData,
  RouteRequest,
  Estimate
} from "@0xsquid/squid-types";
import { ethers } from "ethers";
import { LogLevel } from "../error";

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

export type ApproveRoute = {
  route: RouteData;
  signer: ethers.Wallet | ethers.Signer;
  executionSettings?: {
    infiniteApproval?: boolean;
  };
  overrides?: OverrideParams;
};

export type ExecutionSettings = {
  infiniteApproval?: boolean;
};

export type ExecuteRoute = {
  signer: ethers.Wallet | ethers.Signer;
  route: RouteData;
  executionSettings?: ExecutionSettings;
  overrides?: OverrideParams;
};

export type GetStatus = {
  transactionId: string;
  requestId?: string;
  integratorId?: string;
};

export type IsRouteApproved = {
  route: RouteData;
  sender: string;
};

export type RouteParamsPopulated = {
  fromChain: ChainData;
  toChain: ChainData;
  fromToken: Token;
  toToken: Token;
  fromTokenContract: ethers.Contract | undefined;
  fromProvider: ethers.providers.JsonRpcProvider;
  fromIsNative: boolean;
};

export type RouteResponse = {
  route: RouteData;
  requestId?: string;
  integratorId?: string;
  status?: string;
  message?: string;
};

export type ValidateBalanceAndApproval = {
  route: RouteData;
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
