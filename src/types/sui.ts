import {
  SuiSignAndExecuteTransactionOutput,
  SuiSignAndExecuteTransactionFeature,
  WalletWithFeatures,
} from "@mysten/wallet-standard";

/**
 * Only required feature is `sui:signTransaction`
 */
export type SuiSigner = WalletWithFeatures<SuiSignAndExecuteTransactionFeature>;

export type SuiTxResponse = SuiSignAndExecuteTransactionOutput;
