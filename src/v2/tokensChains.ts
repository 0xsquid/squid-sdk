import { ChainData, Token } from "@0xsquid/squid-types";
import { ErrorType, SquidError } from "./error";

export class TokensChains {
  public tokens: Token[] = [];
  public chains: ChainData[] = [];

  getTokenData(address: string, chainId: string): Token {
    const token = this.tokens.find(
      e =>
        e.address.toLowerCase() === address?.toLowerCase() &&
        e.chainId == chainId
    );

    if (!token) {
      throw new SquidError({
        message: `Could not find token with address ${address} on chain ${chainId}`,
        errorType: ErrorType.ValidationError
      });
    }

    return token;
  }

  getChainData(chainId: string): ChainData {
    const chain = this.chains.find(chain => chain.chainId == chainId);

    if (!chain) {
      throw new SquidError({
        message: `Could not find chain with ${chainId}`,
        errorType: ErrorType.ValidationError
      });
    }

    return chain;
  }
}
