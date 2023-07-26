import { ChainData, RouteRequest, SquidData } from "@0xsquid/squid-types";
import { ethers, UnsignedTransaction } from "ethers";

import { TokensChains } from "./tokensChains";
import { nativeTokenConstant } from "./constants";
import { SquidError, ErrorType } from "./error";
import {
  ExecuteRoute,
  OverrideParams,
  RouteData,
  RouteParamsPopulated
} from "./types";
import erc20Abi from "./abi/erc20.json";

export class Utils extends TokensChains {
  async validateNativeBalance({
    fromProvider,
    sender,
    amount,
    fromChain
  }: {
    fromProvider: ethers.providers.JsonRpcProvider;
    sender: string;
    amount: bigint;
    fromChain: ChainData;
  }) {
    const balance = BigInt((await fromProvider.getBalance(sender)).toString());

    if (amount > balance) {
      throw new SquidError({
        message: `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`,
        errorType: ErrorType.ValidationError
      });
    }

    return {
      isApproved: true,
      message: `User has the expected balance ${amount} of ${fromChain.nativeCurrency.symbol}`
    };
  }

  async validateTokenBalance({
    amount,
    fromTokenContract,
    sender,
    fromChain
  }: {
    amount: bigint;
    fromTokenContract: ethers.Contract;
    sender: string;
    fromChain: ChainData;
  }) {
    const balance = BigInt(
      (
        await (fromTokenContract as ethers.Contract).balanceOf(sender)
      ).toString()
    );

    if (amount > balance) {
      throw new SquidError({
        message: `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`,
        errorType: ErrorType.ValidationError
      });
    }

    return {
      isApproved: true,
      message: `User has approved Squid to use ${amount} of ${await (
        fromTokenContract as ethers.Contract
      ).symbol()}`
    };
  }

  getRawTxHex({
    nonce,
    route,
    overrides
  }: Omit<ExecuteRoute, "signer"> & { nonce: number }): string {
    if (!route.transactionRequest) {
      throw new SquidError({
        message: `transactionRequest property is missing in route object`,
        errorType: ErrorType.ValidationError
      });
    }

    const { target, data, value } = route.transactionRequest;

    const gasData = this.getGasData({
      transactionRequest: route.transactionRequest,
      overrides
    });

    return ethers.utils.serializeTransaction({
      chainId: parseInt(route.params.fromChain as string),
      to: target,
      data: data,
      value: value,
      nonce,
      ...gasData
    } as UnsignedTransaction);
  }

  getGasData = ({
    transactionRequest,
    overrides
  }: {
    transactionRequest: SquidData;
    overrides: OverrideParams | undefined;
  }) => {
    const { gasLimit, gasPrice, maxPriorityFeePerGas, maxFeePerGas } =
      transactionRequest;

    const gasParams = maxPriorityFeePerGas
      ? {
          gasLimit,
          maxPriorityFeePerGas,
          maxFeePerGas
        }
      : {
          gasLimit,
          gasPrice
        };

    return overrides ? { ...gasParams, ...overrides } : gasParams;
  };

  populateRouteParams(params: RouteRequest): RouteParamsPopulated {
    const { fromChain, toChain, fromToken, toToken } = params;

    const _fromChain = this.getChainData(fromChain);
    const _toChain = this.getChainData(toChain);
    const _fromToken = this.getTokenData(fromToken, fromChain);
    const _toToken = this.getTokenData(toToken, toChain);

    const fromProvider = new ethers.providers.JsonRpcProvider(_fromChain.rpc);

    const fromIsNative = _fromToken.address === nativeTokenConstant;
    let fromTokenContract;

    if (!fromIsNative) {
      fromTokenContract = new ethers.Contract(
        _fromToken.address,
        erc20Abi,
        fromProvider
      );
    }

    return {
      ...params,
      fromChain: _fromChain,
      toChain: _toChain,
      fromToken: _fromToken,
      toToken: _toToken,
      fromTokenContract,
      fromProvider,
      fromIsNative
    };
  }

  validateTransactionRequest(route: RouteData) {
    if (!route.transactionRequest) {
      throw new SquidError({
        message: `transactionRequest param not found in route object`,
        errorType: ErrorType.ValidationError
      });
    }
  }
}
