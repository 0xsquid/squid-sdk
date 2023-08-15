import { ethers } from "ethers";

export type RpcProvider = ethers.providers.JsonRpcProvider;
export type Contract = ethers.Contract;
export type ContractRunner = any; // ethers.ContractRunner;
export type Interface = ethers.utils.Interface;

export type EvmWallet = ethers.Wallet;

export type Transaction = ethers.Transaction;
export type TransactionResponse = any; // ethers.TransactionResponse;
export type TransactionRequest = any; // ethers.TransactionRequest;

export type GasData = {
  gasLimit: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
};
