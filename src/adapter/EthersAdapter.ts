import { ethers } from "ethers";

import {
  RpcProvider,
  Contract,
  Interface,
  WalletV6,
  EvmWallet
} from "../types";

export class EthersAdapter {
  rpcProvider(rpc: string): RpcProvider {
    return new ethers.JsonRpcProvider(rpc);
  }

  contract(
    address: string,
    abi: any,
    provider: RpcProvider | EvmWallet
  ): Contract {
    // type hack to support ethers v5
    return new ethers.Contract(
      address,
      abi,
      provider as RpcProvider | WalletV6
    );
  }

  interface(abi: any): Interface {
    return new ethers.Interface(abi);
  }

  serializeTransaction(tx: {
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
    return ethers.Transaction.from(tx).unsignedSerialized;
  }
}
