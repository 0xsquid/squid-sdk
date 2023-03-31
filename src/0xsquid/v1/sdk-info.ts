import { SdkInfoResponse } from "../../types";
import { parseTokenDataList } from "./tokens";
import { parseChainData } from "./chains";

export const parseSdkInfoResponse = (response: any): SdkInfoResponse => {
  const {
    chains,
    tokens,
    axelarscanURL,
    isInMaintenanceMode,
    expressDefaultDisabled
  } = response;
  return {
    chains: parseChainData(chains),
    tokens: parseTokenDataList(tokens),
    axelarscanURL,
    isInMaintenanceMode,
    expressDefaultDisabled
  };
};
