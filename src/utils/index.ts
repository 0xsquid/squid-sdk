import { AxiosRequestHeaders } from "axios";
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

export const getHeaderTracker = (headers: AxiosRequestHeaders) => {
  return {
    requestId:
      headers && "x-request-id" in headers
        ? (headers["x-request-id"] as string)
        : undefined,
    integratorId:
      headers && "x-integrator-id" in headers
        ? (headers["x-integrator-id"] as string)
        : undefined
  };
};
