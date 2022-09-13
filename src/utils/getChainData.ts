import { mapChainIdName } from "../constants/chains";
import { ChainData, ChainsData } from "../types";

export const getChainData = (
  chains: ChainsData,
  chainId: number | string
): ChainData | undefined => {
  return chains.find(chain => chain.chainId == chainId);
};
