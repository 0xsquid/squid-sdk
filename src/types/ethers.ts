import { ethers } from "ethers";

export type RpcProvider = ethers.providers.JsonRpcProvider;
export type Contract = ethers.Contract;

export type Signer = ethers.Signer;
export type Wallet = ethers.Wallet;
export type EvmSigner = Signer | Wallet;

export type UnsignedTransaction = ethers.UnsignedTransaction;
export type TransactionResponse = ethers.providers.TransactionResponse;
export type TransactionRequest = ethers.providers.TransactionRequest;
