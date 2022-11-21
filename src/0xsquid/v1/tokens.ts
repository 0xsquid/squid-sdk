import { TokenData, TokensResponse } from "../../types";

export const parseTokenData = (data: any): TokenData => {
  const { chainId, address, name, symbol, decimals, logoURI, coingeckoId } =
    data;
  return {
    chainId,
    address,
    name,
    symbol,
    decimals,
    logoURI,
    coingeckoId
  };
};

export const parseTokenDataList = (data: any[]): TokenData[] => {
  const tokenDataList = data.map((token: any) => {
    return parseTokenData(token);
  });
  return tokenDataList;
};

export const parseTokensResponse = (response: any): TokensResponse => {
  const tokensResponse = {
    tokens: parseTokenDataList(response.tokens)
  };
  return tokensResponse;
};
