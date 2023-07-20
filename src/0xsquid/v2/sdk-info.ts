import { SdkInfoResponse } from "types";
import { parseChainData } from "./chains";
import { parseTokenDataList } from "./tokens";

export const parseSdkInfoResponse = (response: any): SdkInfoResponse => {
  const { chains, tokens, axelarscanURL } = response;
  return {
    chains: parseChainData(chains),
    tokens: parseTokenDataList(tokens),
    axelarscanURL,
    isInMaintenanceMode: false,
    expressDefaultDisabled: []
  };
};
