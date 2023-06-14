import { SdkInfoResponse } from "../../types";
import { parseChainData } from "./chains";
import { parseTokenDataList } from "./tokens";

export const parseSdkInfoResponse = (response: any): SdkInfoResponse => {
  const {
    chains,
    tokens,
    axelarscanURL,
    isInMaintenanceMode,
    maintenanceMessage,
    expressDefaultDisabled
  } = response;
  return {
    chains: parseChainData(chains),
    tokens: parseTokenDataList(tokens),
    axelarscanURL,
    isInMaintenanceMode,
    maintenanceMessage,
    expressDefaultDisabled
  };
};
