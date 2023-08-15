import { ethers } from "ethers";

export type RpcProvider = ethers.JsonRpcProvider;
export type Contract = ethers.Contract;
export type ContractRunner = ethers.ContractRunner;
export type Interface = ethers.Interface;

export type EvmWallet = ethers.Wallet;

export type Transaction = ethers.Transaction;
export type TransactionResponse = ethers.TransactionResponse;
export type TransactionRequest = ethers.TransactionRequest;

export type GasData = {
  gasLimit: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
};
