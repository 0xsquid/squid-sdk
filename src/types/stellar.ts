import { Keypair } from "@stellar/stellar-sdk";
import { Api } from "@stellar/stellar-sdk/lib/rpc/api";

export type StellarSigner = Keypair;

export type StellarResponse = Api.SendTransactionResponse;
