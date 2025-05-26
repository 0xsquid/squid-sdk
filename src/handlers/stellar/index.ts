import { OnChainExecutionData } from "@0xsquid/squid-types";
import { BASE_FEE, Networks, TransactionBuilder, rpc, xdr } from "@stellar/stellar-sdk";

import { ExecuteRoute, StellarTxResponse } from "types";
import { StellarSigner } from "types/stellar";

export class StellarHandler {
  async executeRoute({
    data,
    rpcUrl,
  }: {
    data: ExecuteRoute;
    rpcUrl: string;
  }): Promise<StellarTxResponse> {
    const { route } = data;

    const signer = data.signer as StellarSigner;
    const onChainExecutationRequest = route.transactionRequest as OnChainExecutionData;

    const server = new rpc.Server(rpcUrl);
    const account = await server.getAccount(signer.publicKey() || ""); // Use public key from keypair

    const operation = xdr.Operation.fromXDR(onChainExecutationRequest.data, "hex");

    const builtTransaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Sign the transaction
    const prepareTransaction = await server.prepareTransaction(builtTransaction);

    prepareTransaction.sign(signer);

    try {
      const transactionResult = await server.sendTransaction(prepareTransaction);
      return transactionResult;
    } catch (e) {
      console.error("Error submitting Stellar transaction:", e);
      throw e; // Re-throw the error to be caught by the main catch block
    }
  }
}
