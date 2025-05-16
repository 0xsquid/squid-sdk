import { SUI_MAINNET_CHAIN, SUI_TESTNET_CHAIN, SuiChain } from "@mysten/wallet-standard";

export function getSuiChain(chainId: string): SuiChain | null {
  switch (chainId) {
    case "sui-mainnet":
      return SUI_MAINNET_CHAIN;
    case "sui-testnet":
      return SUI_TESTNET_CHAIN;
    default:
      return null;
  }
}
