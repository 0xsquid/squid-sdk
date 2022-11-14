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

export const parseBridge = (respBridge: any): Call => {
  const bridge = {
    fromToken: respBridge.fromToken,
    toToken: respBridge.toToken,
    fromAmount: respBridge.fromAmount,
    toAmount: respBridge.toAmount,
    toAmountMin: respBridge.toAmountMin,
    exchangeRate: respBridge.exchangeRate,
    priceImpact: respBridge.priceImpact
  } as Bridge;
  return {
    type: CallType.BRIDGE,
    callDetails: bridge
  };
};

export const parseSwap = (respSwap: any): Call => {
  const swap = {
    dex: {
      chainName: respSwap.dex.chainName,
      dexName: respSwap.dex.dexName,
      swapRouter: respSwap.dex.swapRouter
    },
    squidCallType: respSwap.squidCallType,
    path: respSwap.path,
    fromToken: respSwap.fromToken as TokenData,
    toToken: respSwap.toToken as TokenData,
    fromAmount: respSwap.fromAmount,
    toAmount: respSwap.toAmount,
    toAmountMin: respSwap.toAmountMin,
    exchangeRate: respSwap.exchangeRate,
    priceImpact: respSwap.priceImpact
  } as Swap;
  respSwap.dynamicSlippage
    ? (swap.dynamicSlippage = respSwap.dynamicSlippage)
    : undefined;
  return {
    type: CallType.SWAP,
    callDetails: swap
  };
};

export const parseCustom = (respCustom: any): Call => {
  const customCall = {
    callType: respCustom.callType,
    target: respCustom.target,
    callData: respCustom.callData,
    estimatedGas: respCustom.estimatedGas
  } as ContractCall;
  respCustom.value ? (customCall.value = respCustom.value) : undefined;
  respCustom.payload ? (customCall.payload = respCustom.payload) : undefined;
  return {
    type: CallType.CUSTOM,
    callDetails: customCall
  };
};

export const parseRouteData = (respRouteData: any): RouteData[] => {
  const routeData: RouteData[] = respRouteData
    .filter(call =>
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

export const parseFeeCost = (respFeeCost: any): FeeCost[] =>
  respFeeCost.map((item: any) => {
    return {
      name: item.name,
      description: item.description,
      percentage: item.percentage,
      token: item.token as TokenData,
      amount: item.amount,
      amountUSD: item.amountUSD
    };
  });

export const parseGasCost = (respGasCost: any): GasCost[] =>
  respGasCost.map((item: any) => {
    return {
      type: item.type,
      token: item.token as TokenData,
      amount: item.amount,
      amountUSD: item.amountUSD,
      gasPrice: item.gasPrice,
      maxFeePerGas: item.maxFeePerGas,
      maxPriorityFeePerGas: item.maxPriorityFeePerGas,
      estimate: item.estimate,
      limit: item.limit
    };
  });

export const parseEstimate = (respEstimate: any): Estimate => {
  const estimate = {
    fromAmount: respEstimate.fromAmount,
    sendAmount: respEstimate.sendAmount,
    toAmount: respEstimate.toAmount,
    toAmountMin: respEstimate.toAmountMin,
    route: parseRouteData(respEstimate.route),
    exchangeRate: respEstimate.exchangeRate,
    estimatedRouteDuration: respEstimate.estimatedRouteDuration,
    aggregatePriceImpact: respEstimate.aggregatePriceImpact,
    feeCosts: parseFeeCost(respEstimate.FeeCost),
    gasCosts: respEstimate.GasCost
  } as Estimate;
  return estimate;
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
