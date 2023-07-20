import { ChainData, Token } from "@0xsquid/squid-types";
import { AxiosRequestHeaders } from "axios";

export const getTokenData = (
  tokens: Token[],
  address: string,
  chainId: string
): Token | undefined =>
  tokens.find(
    e =>
      e.address.toLowerCase() === address?.toLowerCase() && e.chainId == chainId
  );

export const getChainData = (
  chains: ChainData[],
  chainId: string
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
