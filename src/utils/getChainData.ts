import { ChainData, ChainsData } from "../types";

export const getChainData = (
  chains: ChainsData,
  chainId: number | string
): ChainData | undefined => chains.find(chain => chain.chainId == chainId);
