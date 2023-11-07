import { TokenData, TokensResponse } from "../../types";
import { removeEmpty } from "./util";
export const parseTokenData = (data: any): TokenData => {
  const {
    chainId,
    address,
    name,
    symbol,
    decimals,
    logoURI,
    coingeckoId,
    commonKey,
    bridgeOnly,
    ibcDenom,
    codeHash
  } = data;
  return removeEmpty({
    chainId,
    address,
    name,
    symbol,
    decimals,
    logoURI,
    coingeckoId,
    commonKey,
    bridgeOnly,
    ibcDenom,
    codeHash
  });
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
