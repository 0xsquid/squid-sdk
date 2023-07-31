import { ethers } from "ethers";

import {
  RpcProvider,
  EvmSigner,
  UnsignedTransaction,
  Contract
} from "../types/ethers";

export class EthersAdapter {
  rpcProvider(rpc: string): RpcProvider {
    return new ethers.providers.JsonRpcProvider(rpc);
  }

  contract(
    address: string,
    abi: any,
    provider: RpcProvider | EvmSigner
  ): Contract {
    return new ethers.Contract(address, abi, provider);
  }

  isSigner(signer: EvmSigner): boolean {
    return ethers.Signer.isSigner(signer);
  }

  serializeTransaction(tx: UnsignedTransaction): string {
    return ethers.utils.serializeTransaction(tx);
  }
}
