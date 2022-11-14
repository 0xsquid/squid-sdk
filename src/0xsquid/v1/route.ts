import {
  Estimate,
  RouteResponse,
  TransactionRequest,
  RouteParams,
  RouteData,
  Call,
  CallType,
  Bridge,
  Swap,
  TokenData,
  ContractCall,
  FeeCost,
  GasCost
} from "../../types";

const removeEmpty = (obj: any) => {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
    else if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
};

export const parseBridge = (response: any): Call => {
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact
  } = response as Bridge;
  return {
    type: CallType.BRIDGE,
    callDetails: {
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      toAmountMin,
      exchangeRate,
      priceImpact
    }
  };
};

export const parseSwap = (response: any): Call => {
  const {
    dex: { chainName, dexName, swapRouter },
    squidCallType,
    path,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact,
    dynamicSlippage
  } = response as Swap;
  return removeEmpty({
    type: CallType.SWAP,
    callDetails: {
      dex: { chainName, dexName, swapRouter },
      squidCallType,
      path,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      toAmountMin,
      exchangeRate,
      priceImpact,
      dynamicSlippage
    }
  });
};

export const parseCustom = (response: any): Call => {
  const { callType, target, value, callData, estimatedGas, payload } =
    response as ContractCall;
  return removeEmpty({
    type: CallType.CUSTOM,
    callDetails: { callType, target, value, callData, estimatedGas, payload }
  });
};

export const parseRouteData = (response: any): RouteData[] => {
  const routeData: RouteData[] = response
    .filter((call: any) =>
      [CallType.BRIDGE, CallType.CUSTOM, CallType.SWAP].includes(call.type)
    )
    .map((call: any) => {
      switch (call.type as CallType) {
        case CallType.BRIDGE:
          return parseBridge(call.callDetails);
        case CallType.SWAP:
          return parseSwap(call.callDetails);
        case CallType.CUSTOM:
          return parseCustom(call.callDetails);
      }
    });
  return routeData;
};

export const parseFeeCost = (response: any): FeeCost[] =>
  response.map((item: any) => {
    return {
      name: item.name,
      description: item.description,
      percentage: item.percentage,
      token: item.token as TokenData,
      amount: item.amount,
      amountUSD: item.amountUSD
    };
  });

export const parseGasCost = (response: any): GasCost[] =>
  response.map((item: any) => {
    const {
      type,
      token,
      amount,
      amountUSD,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimate,
      limit
    } = item as GasCost;
    return {
      type,
      token: token as TokenData,
      amount,
      amountUSD,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimate,
      limit
    };
  });

export const parseEstimate = (response: any): Estimate => {
  const {
    fromAmount,
    sendAmount,
    toAmount,
    toAmountMin,
    route,
    exchangeRate,
    estimatedRouteDuration,
    aggregatePriceImpact,
    feeCosts,
    gasCosts
  } = response as Estimate;

  const estimate = {
    fromAmount,
    sendAmount,
    toAmount,
    toAmountMin,
    route: parseRouteData(route),
    exchangeRate,
    estimatedRouteDuration,
    aggregatePriceImpact,
    feeCosts: parseFeeCost(feeCosts),
    gasCosts: parseGasCost(gasCosts)
  } as Estimate;
  return estimate;
};

export const parseTransactionRequest = (response: any) => {
  const {
    routeType,
    targetAddress,
    data,
    value,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = response as TransactionRequest;
  return {
    routeType,
    targetAddress,
    data,
    value,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas
  };
};

export const parseParams = (response: any): RouteParams => {
  const {
    fromChain,
    toChain,
    fromToken,
    toToken,
    toAddress,
    slippage,
    quoteOnly,
    enableForecall,
    customContractCalls
  } = response as RouteParams;
  return removeEmpty({
    fromChain,
    toChain,
    fromToken: fromToken as TokenData,
    toToken: toToken as TokenData,
    toAddress,
    slippage,
    quoteOnly,
    enableForecall,
    customContractCalls
  });
};

export const parseRouteResponse = (response: any): RouteResponse => {
  const routeResponse = {
    route: {
      estimate: parseEstimate(response.estimate),
      transactionRequest: {} as TransactionRequest,
      params: {} as RouteParams
    }
  };
  return routeResponse;
};
