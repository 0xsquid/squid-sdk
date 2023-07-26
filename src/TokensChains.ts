import { ChainData, Token } from "@0xsquid/squid-types";

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
      throw new Error(
        `Could not find token with address ${address} on chain ${chainId}`
      );
    }

    return token;
  }

  getChainData(chainId: string): ChainData {
    const chain = this.chains.find(chain => chain.chainId == chainId);

    if (!chain) {
      throw new Error(`Could not find chain with ${chainId}`);
    }

    return chain;
  }
}
