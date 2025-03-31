import { ExecuteRoute, OnChainExecutionData } from "types";
import { Transaction } from "@mysten/sui/transactions";
import type {
  WalletWithRequiredFeatures as SuiStandardWallet,
  SuiSignAndExecuteTransactionOutput,
} from "@mysten/wallet-standard";

export class SuiHandler {
  async executeRoute({
    data,
  }: {
    data: ExecuteRoute;
  }): Promise<SuiSignAndExecuteTransactionOutput> {
    const { route } = data;
    const signer = data.signer as SuiStandardWallet;

    const txJson = (route.transactionRequest! as OnChainExecutionData).data;
    const tx = Transaction.from(txJson);

    return await signer.features["sui:signAndExecuteTransaction"]?.signAndExecuteTransaction({
      transaction: tx,
      account: signer.accounts[0],
      chain: signer.chains[0],
    })!;
  }
}
