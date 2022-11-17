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
  FeeCost,
  GasCost,
  CustomCall,
  ContractCall,
  OptimalRoutes
} from "../../types";

//@typescript-eslint/no-explicit-any
const removeEmpty = (obj: any) => {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] === Object(obj[key])) {
      if (obj[key].length >= 0) newObj[key] = obj[key]; //handle array
      else newObj[key] = removeEmpty(obj[key]);
    } else if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const parseTokenData = (response: any): TokenData => {
  const { chainId, address, name, symbol, decimals, logoURI, coingeckoId } =
    response;
  return {
    chainId,
    address,
    name,
    symbol,
    decimals,
    logoURI,
    coingeckoId
  };
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
  } = response;
  return {
    type: CallType.BRIDGE,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact
  } as Bridge;
};

export const parseSwap = (response: any): Call => {
  const {
    type,
    dex: { chainName, dexName, factory, isStable, swapRouter },
    path,
    squidCallType,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact,
    dynamicSlippage
  } = response;
  return removeEmpty({
    type,
    dex: { chainName, dexName, factory, isStable, swapRouter },
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
  } as Swap);
};

export const parseCustom = (response: any): Call => {
  const { type, callType, target, value, callData, estimatedGas, payload } =
    response;
  return removeEmpty({
    type,
    callType,
    target,
    value,
    callData,
    estimatedGas,
    payload
  } as CustomCall);
};

export const parseCalls = (response: any[]): Call[] => {
  const calls = response
    .filter((call: Call) =>
      [CallType.BRIDGE, CallType.CUSTOM, CallType.SWAP].includes(call.type)
    )
    .map((call: any) => {
      switch (call.type as CallType) {
        case CallType.BRIDGE:
          return parseBridge(call);
        case CallType.SWAP:
          return parseSwap(call);
        case CallType.CUSTOM:
          return parseCustom(call);
      }
    });
  return calls;
};

export const parseRouteData = (response: any): RouteData => {
  const { fromChain, toChain } = response;
  const routeData = {
    fromChain: parseCalls(fromChain),
    toChain: parseCalls(toChain)
  };
  return routeData;
};

export const parseFeeCost = (response: any): FeeCost[] =>
  response.map((item: any) => {
    return {
      name: item.name,
      description: item.description,
      percentage: item.percentage,
      token: parseTokenData(item.token),
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
    } = item;
    return {
      type,
      token: parseTokenData(token),
      amount,
      amountUSD,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimate,
      limit
    } as GasCost;
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
  } = response;
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

export const parseTransactionRequest = (response: any): TransactionRequest => {
  const {
    routeType,
    targetAddress,
    data,
    value,
    gasLimit,
    gasPrice,
    gasCosts,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = response;
  return {
    routeType,
    targetAddress,
    data,
    value,
    gasLimit,
    gasPrice,
    gasCosts,
    maxFeePerGas,
    maxPriorityFeePerGas
  } as TransactionRequest;
};

export const parseCustomContractCall = (response: any): ContractCall => {
  const { callType, target, value, callData, estimatedGas } = response;
  return removeEmpty({
    callType,
    target,
    value, //optional
    callData,
    payload: response.payload ? response.payload : undefined,
    estimatedGas
  } as ContractCall);
};

export const parseParams = (response: any): RouteParams => {
  const {
    fromChain,
    toChain,
    fromToken,
    fromAmount,
    toToken,
    toAddress,
    slippage,
    quoteOnly, //optional
    enableForecall //optional
  } = response;
  return removeEmpty({
    fromChain,
    toChain,
    fromAmount,
    fromToken: parseTokenData(fromToken),
    toToken: parseTokenData(toToken),
    toAddress,
    slippage,
    quoteOnly,
    enableForecall: enableForecall ? enableForecall : undefined,
    customContractCalls: response.customContractCalls
      ? parseCustomContractCall(response.customContractCalls)
      : undefined
  });
};

export const parseRouteResponse = (response: any): RouteResponse => {
  const routeResponse = {
    route: {
      estimate: parseEstimate(response.estimate),
      transactionRequest: parseTransactionRequest(response.transactionRequest),
      params: parseParams(response.params)
    }
  };
  return routeResponse;
};
