import { ChainData, TokenData } from "../types";

export const getTokenData = (
  tokens: TokenData[],
  address: string,
  chainId: number | string
): TokenData | undefined =>
  tokens.find(
    e =>
      e.address.toLowerCase() === address?.toLowerCase() && e.chainId == chainId
  );

export const getChainData = (
  chains: ChainData[],
  chainId: number | string
): ChainData | undefined => chains.find(chain => chain.chainId == chainId);
