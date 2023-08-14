import { ethers } from "ethers";

import { RpcProvider, EvmWallet, Contract, Interface } from "../types/ethers";

export class EthersAdapter {
  rpcProvider(rpc: string): RpcProvider {
    return new ethers.JsonRpcProvider(rpc);
  }

  contract(
    address: string,
    abi: any,
    provider: RpcProvider | EvmWallet
  ): Contract {
    return new ethers.Contract(address, abi, provider);
  }

  interface(abi: any): Interface {
    return new ethers.Interface(abi);
  }

  serializeTransaction({
    chainId,
    to,
    data,
    value,
    nonce,
    gasLimit,
    gasPrice,
    maxPriorityFeePerGas,
    maxFeePerGas
  }: {
    chainId: number;
    to: string;
    data: string;
    value: string;
    nonce: number;
    gasLimit: string;
    gasPrice?: string;
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
  }): string {
    const transaction = new ethers.Transaction();

    transaction.chainId = chainId;
    transaction.to = to;
    transaction.data = data;
    transaction.value = value;
    transaction.nonce = nonce;
    transaction.gasLimit = gasLimit;

    if (maxPriorityFeePerGas) {
      transaction.maxPriorityFeePerGas = maxPriorityFeePerGas;
      transaction.maxFeePerGas = maxFeePerGas as string;
    } else {
      transaction.gasPrice = gasPrice as string;
    }

    return transaction.unsignedSerialized;
  }
}
