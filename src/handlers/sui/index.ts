import { ExecuteRoute, OnChainExecutionData, SuiTxResponse, SuiSigner } from "types";
import { Transaction } from "@mysten/sui/transactions";
import { getSuiChain } from "utils/sui";

export class SuiHandler {
  async executeRoute({ data }: { data: ExecuteRoute }): Promise<SuiTxResponse> {
    const { route } = data;
    const fromChainId = route.params.fromChain;
    const suiChain = getSuiChain(fromChainId);

    if (!suiChain) {
      throw new Error(`No Sui chain found for chainId ${fromChainId}`);
    }

    const signer = data.signer as SuiSigner;
    const txJson = (route.transactionRequest as OnChainExecutionData).data;
    const tx = Transaction.from(txJson);

    return await signer.features["sui:signAndExecuteTransaction"].signAndExecuteTransaction({
      transaction: tx,
      account: signer.accounts[0],
      chain: suiChain,
    });
  }
}
