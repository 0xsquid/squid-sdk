import { Token } from "@0xsquid/squid-types";
import { removeEmpty } from "../util";
import { TokensResponse } from "types";
export const parseTokenData = (data: any): Token => {
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
    type,
    usdPrice
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
    type,
    usdPrice,
    ibcDenom
  });
};

export const parseTokenDataList = (data: any[]): Token[] => {
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
