import { TokenData } from "../types";

export const getTokenData = (
  tokens: TokenData[],
  address: string,
  chainId: number
): TokenData | undefined =>
  tokens.find(
    e =>
      e.address.toLowerCase() === address.toLowerCase() && e.chainId === chainId
  );
