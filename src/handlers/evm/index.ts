import erc20Abi from "../../abi/erc20.json";
import { EthersAdapter } from "../../adapter/EthersAdapter";

import {
  Contract,
  EvmWallet,
  ExecuteRoute,
  OnChainExecutionData,
  RouteParamsPopulated,
  RouteRequest,
  Token,
  TokenBalance,
  TransactionRequest,
  TransactionResponse,
  WalletV6,
} from "../../types";

import {
  CHAINS_WITHOUT_MULTICALL,
  NATIVE_EVM_TOKEN_ADDRESS,
  uint256MaxValue,
} from "../../constants";
import { TokensChains } from "../../utils/TokensChains";
import { Utils } from "./utils";

const ethersAdapter = new EthersAdapter();

export class EvmHandler extends Utils {
  async executeRoute({
    data,
    params,
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<TransactionResponse> {
    const {
      route: { transactionRequest },
      overrides,
    } = data;
    const { target, value, data: _data } = transactionRequest as OnChainExecutionData;
    const signer = data.signer as WalletV6;

    const gasData = this.getGasData({
      transactionRequest: data.route.transactionRequest as OnChainExecutionData,
      overrides,
    });

    if (!data.bypassBalanceChecks) {
      await this.validateBalanceAndApproval({
        data: {
          ...data,
          overrides: gasData,
        },
        params,
      });
    }

    const tx = {
      to: target,
      data: _data,
      value,
      chainId: Number(params.fromChain.chainId),
      ...gasData,
    } as TransactionRequest;

    return await signer.sendTransaction(tx);
  }

  async validateBalance({
    sender,
    params,
  }: {
    sender: string;
    params: RouteParamsPopulated;
  }): Promise<{
    isApproved: boolean;
    message: string;
  }> {
    const { fromAmount, fromIsNative, fromProvider, fromChain, fromTokenContract } = params;

    const amount = BigInt(fromAmount);

    if (fromIsNative) {
      return await this.validateNativeBalance({
        fromProvider,
        sender,
        amount,
        fromChain,
      });
    } else {
      return await this.validateTokenBalance({
        amount,
        fromTokenContract: fromTokenContract as Contract,
        fromChain,
        sender,
      });
    }
  }

  async validateBalanceAndApproval({
    data,
    params,
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<boolean> {
    const wallet = data.signer as EvmWallet;

    // support of multiple signers type and versions
    let address = (wallet as any).address;

    // ethers v5 & v6 support
    try {
      address = await wallet.getAddress();
    } catch (error) {
      // do nothing
    }

    // validate balance
    await this.validateBalance({
      sender: address,
      params,
    });

    if (params.fromIsNative) {
      return true;
    }

    const hasAllowance = await this.validateAllowance({
      fromTokenContract: params.fromTokenContract as Contract,
      sender: address,
      router: (data.route.transactionRequest as OnChainExecutionData).target,
      amount: BigInt(params.fromAmount),
    });

    // approve token spent if necessary
    if (!hasAllowance) {
      await this.approveRoute({ data, params });
    }

    return true;
  }

  async approveRoute({
    data,
    params,
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<TransactionResponse | null> {
    const {
      route: { transactionRequest },
      executionSettings,
      overrides,
    } = data;
    const { target } = transactionRequest as OnChainExecutionData;
    const { fromIsNative, fromAmount } = params;
    const fromTokenContract = params.fromTokenContract as Contract;

    if (fromIsNative) {
      return null;
    }

    let amountToApprove = BigInt(uint256MaxValue);

    if (executionSettings?.infiniteApproval === false) {
      amountToApprove = BigInt(fromAmount);
    }

    // Probably strange issue with ethers v6
    // https://github.com/ethers-io/ethers.js/issues/3830
    // Need to manually encode approve, instead of calling fromTokenContract.approve
    // TODO: Find a way to have it work with .approve method
    const approveData = fromTokenContract.interface.encodeFunctionData("approve", [
      target,
      amountToApprove,
    ]);

    return (data.signer as EvmWallet).sendTransaction({
      to: params.preHook ? params.preHook.fundToken : params.fromToken.address,
      data: approveData,
      chainId: Number(params.fromChain.chainId),
      ...overrides,
    });
  }

  async isRouteApproved({
    sender,
    target,
    params,
  }: {
    sender: string;
    target: string;
    params: RouteParamsPopulated;
  }) {
    const result = await this.validateBalance({ sender, params });

    if (params.fromIsNative) {
      return {
        isApproved: true,
        message: "Not required for native token",
      };
    }

    const hasAllowance = await this.validateAllowance({
      fromTokenContract: params.fromTokenContract as Contract,
      sender,
      router: target,
      amount: BigInt(params.fromAmount),
    });

    if (!hasAllowance) {
      return {
        isApproved: false,
        message: "Not enough allowance",
      };
    }

    return result;
  }

  getRawTxHex({
    nonce,
    route,
    overrides,
  }: Omit<ExecuteRoute, "signer"> & { nonce: number }): string {
    const { target, data, value } = route.transactionRequest as OnChainExecutionData;

    const gasData = this.getGasData({
      transactionRequest: route.transactionRequest as OnChainExecutionData,
      overrides,
    });

    return ethersAdapter.serializeTransaction({
      chainId: parseInt(route.params.fromChain as string, 10),
      to: target,
      data: data,
      value: value,
      nonce,
      ...gasData,
    });
  }

  async getBalances(
    evmTokens: Token[],
    userAddress: string,
    chainRpcUrls: {
      [chainId: string]: string;
    },
  ): Promise<TokenBalance[]> {
    try {
      // Some tokens don't support multicall, so we need to fetch them with Promise.all
      // TODO: Once we support multicall on all chains, we can remove this split
      const splittedTokensByMultiCallSupport = evmTokens.reduce(
        (acc, token) => {
          if (CHAINS_WITHOUT_MULTICALL.includes(Number(token.chainId))) {
            acc[0].push(token);
          } else {
            acc[1].push(token);
          }
          return acc;
        },
        [[], []] as Token[][],
      );

      const tokensNotSupportingMulticall = splittedTokensByMultiCallSupport[0];
      const tokensSupportingMulticall = splittedTokensByMultiCallSupport[1];

      const tokensByChainId = tokensSupportingMulticall.reduce(
        (groupedTokens, token) => {
          if (!groupedTokens[token.chainId]) {
            groupedTokens[token.chainId] = [];
          }

          groupedTokens[token.chainId].push(token);

          return groupedTokens;
        },
        {} as Record<string, Token[]>,
      );

      const tokensMulticall: TokenBalance[] = [];

      for (const chainId in tokensByChainId) {
        const tokens = tokensByChainId[chainId];
        const rpcUrl = chainRpcUrls[chainId];

        if (!rpcUrl) continue;

        const tokensBalances = await this.getTokensBalanceSupportingMultiCall(
          tokens,
          rpcUrl,
          userAddress,
        );

        tokensMulticall.push(...tokensBalances);
      }

      const tokensNotMultiCall = await this.getTokensBalanceWithoutMultiCall(
        tokensNotSupportingMulticall,
        userAddress,
        chainRpcUrls,
      );

      return [...tokensMulticall, ...tokensNotMultiCall];
    } catch (error) {
      return [];
    }
  }

  populateRouteParams(
    tokensChains: TokensChains,
    params: RouteRequest,
    signer?: EvmWallet,
  ): RouteParamsPopulated {
    const { fromChain, toChain, fromToken, toToken, preHook } = params;

    const _fromChain = tokensChains.getChainData(fromChain);
    const _toChain = tokensChains.getChainData(toChain);
    const _fromToken = tokensChains.getTokenData(fromToken, fromChain);
    const _toToken = tokensChains.getTokenData(toToken, toChain);

    const fromProvider = ethersAdapter.rpcProvider(_fromChain.rpc);

    const fromIsNative = _fromToken.address.toLowerCase() === NATIVE_EVM_TOKEN_ADDRESS;
    let fromTokenContract;

    if (!fromIsNative) {
      // case preHook, we need to check balance / allowance instead of fromToken
      // to avoid changing the entire approach, we only inject the address on the contract instance for on chain validation
      // need to be considered that fundToken is unknown and we probably do not support
      fromTokenContract = ethersAdapter.contract(
        preHook ? preHook.fundToken : _fromToken.address,
        erc20Abi,
        signer || fromProvider,
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
      fromIsNative,
    };
  }
}
