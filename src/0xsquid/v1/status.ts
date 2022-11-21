import { ApiBasicResponse, TransactionStatus } from "../../types";
import { parseChainData } from "./chains";
import { removeEmpty } from "./util";

export const parseTransactionStatus = (data: any) => {
  const {
    transactionId,
    blockNumber,
    callEventStatus,
    callEventLog,
    chainData,
    transactionUrl
  } = data;
  return removeEmpty({
    transactionId,
    blockNumber,
    callEventStatus,
    callEventLog,
    chainData: parseChainData([chainData]).pop(),
    transactionUrl
  }) as TransactionStatus;
};

export const parseApiBasicResponse = (response: any) => {
  const { error, errorType } = response;
  return removeEmpty({ error, errorType }) as ApiBasicResponse;
};
export const parseStatusResponse = (response: any) => {
  const apiBasicResponse = parseApiBasicResponse(response);
  const {
    id,
    status,
    gasStatus,
    isGMPTransaction,
    axelarTransactionUrl,
    fromChain,
    toChain
  } = response;
  return removeEmpty({
    id,
    status,
    gasStatus,
    isGMPTransaction,
    axelarTransactionUrl,
    fromChain: parseTransactionStatus(fromChain),
    toChain: parseTransactionStatus(toChain),
    ...apiBasicResponse
  });
};
