import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { ethers } from "ethers";

export type RpcProvider = ethers.JsonRpcProvider;
export type Contract = ethers.Contract;
export type ContractRunner = ethers.ContractRunner;
export type Interface = ethers.Interface;

export type WalletV5 = Signer | Wallet;
export type WalletV6 = ethers.Signer | ethers.Wallet;

export type EvmWallet = WalletV6 | WalletV5;

export type Transaction = ethers.Transaction;
export type TransactionResponse = ethers.TransactionResponse;
export type TransactionRequest = ethers.TransactionRequest;

export type GasData = {
  gasLimit: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
};
