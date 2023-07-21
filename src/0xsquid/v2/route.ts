import { removeEmpty } from "../util";
import { AxiosResponseHeaders } from "axios";
import { getHeaderTracker } from "../../utils";
import {
  ChainCall,
  Estimate,
  FeeCost,
  GasCost,
  RouteRequest,
  SquidData
} from "@0xsquid/squid-types";
import { parseTokenData } from "./tokens";
import { RouteData, RouteResponse } from "types";

export const parseFeeCost = (data: any[]): FeeCost[] =>
  data.map((item: any) => {
    return {
      name: item.name,
      description: item.description,
      percentage: item.percentage,
      token: parseTokenData(item.token),
      amount: item.amount,
      amountUSD: item.amountUSD
    };
  });

export const parseGasCost = (data: any): GasCost[] =>
  data.map((item: any) => {
    const { type, token, amount, amountUSD, gasLimit } = item;
    return {
      type,
      token: parseTokenData(token),
      amount,
      amountUSD,
      gasLimit
    } as GasCost;
  });

export const parseEstimate = (data: any): Estimate => {
  const {
    actions,
    fromAmount,
    sendAmount,
    toAmount,
    toAmountMin,
    fromAmountUSD,
    toAmountUSD,
    exchangeRate,
    estimatedRouteDuration,
    aggregatePriceImpact,
    feeCosts,
    gasCosts,
    isExpressSupported
  } = data;
  const estimate = {
    actions,
    fromAmount,
    sendAmount,
    toAmount,
    toAmountMin,
    fromAmountUSD,
    toAmountUSD,
    exchangeRate,
    estimatedRouteDuration,
    aggregatePriceImpact,
    feeCosts: parseFeeCost(feeCosts),
    gasCosts: parseGasCost(gasCosts),
    isExpressSupported
  } as Estimate;
  return estimate;
};

export const parseTransactionRequest = (request: any): SquidData => {
  const {
    routeType,
    target,
    data,
    value,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = request;
  return {
    routeType,
    target,
    data,
    value,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas
  } as SquidData;
};

export const parseCustomChainCall = (data: any): ChainCall => {
  const { callType, target, value, callData, estimatedGas } = data;
  return removeEmpty({
    callType,
    target,
    value, //optional
    callData,
    payload: data.payload ? data.payload : undefined,
    estimatedGas
  } as ChainCall);
};

export const parseParams = (data: any): RouteRequest => {
  const {
    fromChain,
    toChain,
    fromToken,
    fromAmount,
    toToken,
    toAddress,
    slippage,
    quoteOnly, //optional
    enableExpress //optional
  } = data;
  return removeEmpty({
    fromChain,
    toChain,
    fromAmount,
    fromToken,
    toToken,
    toAddress,
    slippage,
    quoteOnly,
    enableExpress: enableExpress ? enableExpress : undefined,
    customContractCalls: data.customContractCalls
      ? parseCustomChainCall(data.customContractCalls)
      : undefined
  });
};

export const parseRouteResponse = (
  response: any,
  headers: AxiosResponseHeaders
): RouteResponse => {
  const { data, status, message } = response;
  const routeResponse = {
    ...getHeaderTracker(headers),
    route:
      data &&
      ({
        estimate: parseEstimate(data.estimate),
        transactionRequest:
          data.transactionRequest &&
          parseTransactionRequest(data.transactionRequest),
        params: parseParams(data.params)
      } as RouteData),
    status,
    message
  };

  return removeEmpty(routeResponse);
};
