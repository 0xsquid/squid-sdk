/* eslint-disable @typescript-eslint/no-unused-vars */
import { ethers } from "ethers";

import { RpcProvider, EvmWallet, Contract, Interface } from "../types/ethers";

export class EthersAdapter {
  rpcProvider(rpc: string): RpcProvider {
    return new ethers.providers.JsonRpcProvider(rpc);
  }

  contract(
    address: string,
    abi: any,
    provider: RpcProvider | EvmWallet
  ): Contract {
    return new ethers.Contract(address, abi, provider);
  }

  interface(abi: any): Interface {
    return new ethers.utils.Interface(abi);
  }

  serializeTransaction(_tx: {
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
    return ""; // ethers.Transaction.from(tx).unsignedSerialized;
  }
}
