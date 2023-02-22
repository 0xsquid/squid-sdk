import { AxiosResponse } from "axios";
import {
  ApiBasicResponse,
  StatusResponse,
  TransactionStatus
} from "../../types";
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

export const parseApiBasicResponse = (response: AxiosResponse) => {
  const { data, status, statusText } = response;
  return removeEmpty({
    errors: data?.errors,
    status: status < 400 ? data?.status : statusText
  }) as ApiBasicResponse;
};

export const parseStatusResponse = (response: AxiosResponse) => {
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
    ...apiBasicResponse
  }) as StatusResponse;
};
