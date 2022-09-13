import { mapChainIdName } from "../constants/chains";
import { ChainData, ChainsData } from "../types";

export const getChainData = (
  chains: ChainsData,
  chainId: number | string
): ChainData | undefined => {
  return Array.isArray(chains)
    ? chains.find(chain => chain.chainId == chainId)
    : ({} as ChainData);
};
