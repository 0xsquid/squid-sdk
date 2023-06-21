import { AxiosResponse, AxiosResponseHeaders } from "axios";
import {
  ApiBasicResponse,
  StatusResponse,
  TransactionStatus
} from "../../types";
import { parseChainData } from "./chains";
import { removeEmpty } from "./util";
import { getHeaderTracker } from "../../utils";

export const parseTransactionStatus = (data: any) => {
  if (!data) {
    return undefined;
  }
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
    chainData: chainData ? parseChainData([chainData]).pop() : undefined,
    transactionUrl
  }) as TransactionStatus;
};

export const parseApiBasicResponse = (response: AxiosResponse) => {
  const { data, status } = response;
  let apiBasicResponse = {};
  if (status >= 400) {
    const { message, errorType } = data.errors[0];

    apiBasicResponse = removeEmpty({
      error: message,
      errorType
    }) as ApiBasicResponse;
  }

  return apiBasicResponse as ApiBasicResponse;
};

export const parseStatusResponse = (
  response: any,
  headers: AxiosResponseHeaders
) => {
  const apiBasicResponse = parseApiBasicResponse(response);
  const {
    id,
    status,
    gasStatus,
    isGMPTransaction,
    axelarTransactionUrl,
    fromChain,
    toChain,
    timeSpent
  } = response.data;
  return removeEmpty({
    id,
    status,
    gasStatus,
    isGMPTransaction,
    axelarTransactionUrl,
    fromChain: parseTransactionStatus(fromChain),
    toChain: parseTransactionStatus(toChain),
    timeSpent: timeSpent,
    ...getHeaderTracker(headers),
    ...apiBasicResponse
  }) as StatusResponse;
};
