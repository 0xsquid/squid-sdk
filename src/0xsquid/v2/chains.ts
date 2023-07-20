import { removeEmpty } from "../util";
import {
  BaseChain,
  ChainData,
  ChainType,
  CosmosChain,
  EvmChain
} from "@0xsquid/squid-types";
import { ChainsResponse } from "types";

export const parseChainNativeContracts = (
  data: any
): {
  wrappedNativeToken: string;
  ensRegistry: string;
  multicall: string;
  usdcToken: string;
} => {
  const { wrappedNativeToken, ensRegistry, multicall, usdcToken } = data;
  return { wrappedNativeToken, ensRegistry, multicall, usdcToken };
};

export const parseAxelarContracts = (
  data: any
): {
  gateway: string;
  forecallable?: string;
} => {
  const { gateway, forecallable } = data;
  return removeEmpty({ gateway, forecallable });
};

export const parseSquidContracts = (
  data: any
): {
  squidRouter: string;
  defaultCrosschainToken?: string;
  squidMulticall?: string;
} => {
  const { squidRouter, defaultCrosschainToken, squidMulticall } = data;
  return removeEmpty({ squidRouter, defaultCrosschainToken, squidMulticall });
};

export const parseBaseChain = (data: any): BaseChain => {
  const {
    chainType,
    axelarChainName,
    networkIdentifier,
    rpc,
    networkName,
    chainId,
    nativeCurrency,
    chainIconURI,
    blockExplorerUrls,
    axelarContracts,
    squidContracts,
    estimatedRouteDuration,
    estimatedExpressRouteDuration,
    swapAmountForGas
  } = data;
  return {
    networkIdentifier,
    axelarChainName,
    chainType,
    rpc,
    networkName,
    chainId,
    nativeCurrency,
    chainIconURI,
    blockExplorerUrls,
    axelarContracts: parseAxelarContracts(axelarContracts),
    squidContracts: parseSquidContracts(squidContracts),
    swapAmountForGas,
    estimatedRouteDuration,
    estimatedExpressRouteDuration
  } as BaseChain;
};

export const parseEvmChain = (data: any): EvmChain => {
  const baseChain = parseBaseChain(data);
  const { chainNativeContracts } = data;
  return {
    ...baseChain,
    chainNativeContracts: parseChainNativeContracts(chainNativeContracts)
  } as EvmChain;
};

export const parseCosmosChain = (data: any): CosmosChain => {
  const baseProperties = parseBaseChain(data);
  const {
    rest,
    stakeCurrency,
    walletUrl,
    walletUrlForStaking,
    bip44,
    alternativeBIP44s,
    bech32Config,
    currencies,
    feeCurrencies,
    coinType,
    features,
    gasPriceStep,
    chainToAxelarChannelId
  } = data;

  return removeEmpty({
    ...baseProperties,
    rest,
    stakeCurrency,
    walletUrl,
    walletUrlForStaking,
    bip44,
    alternativeBIP44s,
    bech32Config,
    currencies,
    feeCurrencies,
    coinType,
    features,
    gasPriceStep,
    chainToAxelarChannelId
  }) as CosmosChain;
};

export const parseChainData = (data: any[]): ChainData[] => {
  const chains = data
    .filter((chain: BaseChain) =>
      [ChainType.EVM, ChainType.COSMOS].includes(chain.chainType)
    )
    .map((chain: any) => {
      switch (chain.chainType as ChainType) {
        case ChainType.EVM:
          return parseEvmChain(chain);
        case ChainType.COSMOS:
          return parseCosmosChain(chain);
      }
    });
  return chains;
};

export const parseChainsResponse = (response: any): ChainsResponse => {
  const chainsResponse = {
    chains: parseChainData(response.chains)
  };
  return chainsResponse;
};
