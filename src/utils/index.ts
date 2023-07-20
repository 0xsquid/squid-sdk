import { ChainData, Token } from "@0xsquid/squid-types";
import { AxiosRequestHeaders } from "axios";
import { ErrorType, SquidError } from "error";
import { Config } from "types";

export const getTokenData = (
  tokens: Token[],
  address: string,
  chainId: string,
  config: Config
): Token => {
  const token = tokens.find(
    e =>
      e.address.toLowerCase() === address?.toLowerCase() && e.chainId == chainId
  );
  if (!token) {
    throw new SquidError({
      message: `Could not find token with address ${address} on chain ${chainId}`,
      errorType: ErrorType.ValidationError,
      logging: config.logging,
      logLevel: config.logLevel
    });
  }
  return token;
};

export const getChainData = (
  chains: ChainData[],
  chainId: string,
  config: Config
): ChainData => {
  const chain = chains.find(chain => chain.chainId == chainId);
  if (!chain) {
    throw new SquidError({
      message: `Could not find chain with ${chainId}`,
      errorType: ErrorType.ValidationError,
      logging: config.logging,
      logLevel: config.logLevel
    });
  }
  return chain;
};

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
