import { BigNumber, ethers } from "ethers";
import axios, { AxiosInstance } from "axios";

import {
  Allowance,
  Approve,
  ApproveRoute,
  Config,
  ExecuteRoute,
  GetRoute,
  GetStatus,
  StatusResponse,
  RouteResponse,
  TokenData,
  IsRouteApproved,
  RouteData,
  RouteParamsData,
  ValidateBalanceAndApproval,
  ChainData,
  RouteParams,
  TransactionRequest
} from "./types";

import erc20Abi from "./abi/erc20.json";
import { getChainData, getTokenData } from "./utils";
import { nativeTokenConstant, uint256MaxValue } from "./constants";
import { ErrorType, SquidError } from "./error";
import { setAxiosInterceptors } from "./utils/setAxiosInterceptors";
import { parseSdkInfoResponse } from "./0xsquid/v1/sdk-info";
import { parseRouteResponse } from "./0xsquid/v1/route";
import { parseStatusResponse } from "./0xsquid/v1/status";

const baseUrl = "https://testnet.api.0xsquid.com/";

export class Squid {
  private axiosInstance: AxiosInstance;

  public initialized = false;
  public config: Config;
  public tokens: TokenData[] = [] as TokenData[];
  public chains: ChainData[] = [] as ChainData[];
  public axelarscanURL: string | undefined;
  public isInMaintenanceMode = false;

  constructor(config = {} as Config) {
    this.axiosInstance = setAxiosInterceptors(
      axios.create({
        baseURL: config?.baseUrl || baseUrl,
        headers: {
          // 'api-key': config.apiKey
        }
      }),
      config
    );

    this.config = {
      baseUrl: config?.baseUrl || baseUrl,
      ...config
    };
  }

  private validateInit() {
    if (!this.initialized) {
      throw new SquidError({
        message:
          "SquidSdk must be initialized! Please call the SquidSdk.init method",
        errorType: ErrorType.InitError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }
  }

  private async validateBalanceAndApproval({
    fromTokenContract,
    fromAmount,
    fromIsNative,
    targetAddress,
    fromProvider,
    fromChain,
    signer,
    infiniteApproval,
    overrides
  }: ValidateBalanceAndApproval) {
    const _sourceAmount = ethers.BigNumber.from(fromAmount);
    let address;

    if (signer && ethers.Signer.isSigner(signer)) {
      address = await (signer as ethers.Signer).getAddress();
    } else {
      address = (signer as ethers.Wallet).address;
    }

    if (!fromIsNative) {
      const balance = await fromTokenContract.balanceOf(address);

      if (_sourceAmount.gt(balance)) {
        throw new SquidError({
          message: `Insufficient funds for account: ${address} on chain ${fromChain.chainId}`,
          errorType: ErrorType.ValidationError,
          logging: this.config.logging,
          logLevel: this.config.logLevel
        });
      }

      const allowance = await fromTokenContract.allowance(
        address,
        targetAddress
      );

      if (_sourceAmount.gt(allowance)) {
        let amountToApprove: BigNumber = ethers.BigNumber.from(uint256MaxValue);

        if (infiniteApproval === false) {
          amountToApprove = _sourceAmount;
        }

        if (
          this.config?.executionSettings?.infiniteApproval === false &&
          !infiniteApproval
        ) {
          amountToApprove = ethers.BigNumber.from(uint256MaxValue);
        }

        const approveTx = await fromTokenContract
          .connect(signer)
          .approve(targetAddress, amountToApprove, overrides);
        await approveTx.wait();
      }
    } else {
      const balance = await fromProvider.getBalance(address);

      if (_sourceAmount.gt(balance)) {
        throw new SquidError({
          message: `Insufficient funds for account: ${address} on chain ${fromChain.chainId}`,
          errorType: ErrorType.ValidationError,
          logging: this.config.logging,
          logLevel: this.config.logLevel
        });
      }
    }
  }

  private validateRouteParams(params: RouteParams): RouteParamsData {
    const { fromChain, toChain, fromToken, toToken } = params;

    const _fromChain = getChainData(
      this.chains as ChainData[],
      params.fromChain
    );
    if (!_fromChain) {
      throw new SquidError({
        message: `fromChain not found for ${fromChain}`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const _toChain = getChainData(this.chains as ChainData[], toChain);
    if (!_toChain) {
      throw new SquidError({
        message: `toChain not found for ${fromChain}`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const fromProvider = new ethers.providers.JsonRpcProvider(_fromChain.rpc);

    const fromIsNative = fromToken.address === nativeTokenConstant;
    let fromTokenContract;

    if (!fromIsNative) {
      fromTokenContract = new ethers.Contract(
        fromToken.address,
        erc20Abi,
        fromProvider
      );
    }

    return {
      fromChain: _fromChain,
      toChain: _toChain,
      fromToken,
      toToken,
      fromTokenContract,
      fromProvider,
      fromIsNative
    };
  }

  private validateTransactionRequest(
    transactionRequest?: TransactionRequest
  ): TransactionRequest {
    if (!transactionRequest) {
      throw new SquidError({
        message: `transactionRequest param not found in route object`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }
    return transactionRequest;
  }

  public async init() {
    const response = await this.axiosInstance.get("/v1/sdk-info");
    if (response.status != 200) {
      throw new SquidError({
        message: `SDK initialization failed`,
        errorType: ErrorType.InitError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }
    const typeResponse = parseSdkInfoResponse(response.data);
    this.tokens = typeResponse.tokens;
    this.chains = typeResponse.chains;
    this.axelarscanURL = typeResponse.axelarscanURL;
    this.isInMaintenanceMode = typeResponse.isInMaintenanceMode;
    this.initialized = true;
  }

  public setConfig(config: Config) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || baseUrl,
      headers: {
        // 'api-key': config.apiKey
      }
    });
    this.config = config;
  }

  public async getRoute(params: GetRoute): Promise<RouteResponse> {
    this.validateInit();
    const response = await this.axiosInstance.get("/v1/route", { params });
    if (response.status != 200) {
      response.data.error;
      throw new SquidError({
        message: response.data.error,
        errorType: ErrorType.RouteResponseError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const route: RouteResponse = parseRouteResponse(response.data);
    return route;
  }

  public async executeRoute({
    signer,
    route,
    executionSettings,
    overrides
  }: ExecuteRoute): Promise<ethers.providers.TransactionResponse> {
    this.validateInit();

    if (!route.transactionRequest) {
      throw new SquidError({
        message: `transactionRequest property is missing in route object`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const { transactionRequest, params } = route;

    const { fromIsNative, fromChain, fromTokenContract, fromProvider } =
      this.validateRouteParams(route.params);

    const {
      targetAddress,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      gasLimit
    } = route.transactionRequest;

    let _gasParams = {};
    if (executionSettings?.setGasPrice) {
      _gasParams = maxPriorityFeePerGas
        ? { maxFeePerGas, maxPriorityFeePerGas, gasLimit }
        : { gasPrice, gasLimit };
    } else {
      _gasParams = { gasLimit };
    }

    const _overrides = overrides
      ? { ..._gasParams, ...overrides }
      : { ..._gasParams };

    if (!fromIsNative) {
      await this.validateBalanceAndApproval({
        fromTokenContract: fromTokenContract as ethers.Contract,
        targetAddress,
        fromProvider,
        fromIsNative,
        fromAmount: params.fromAmount,
        fromChain,
        infiniteApproval: executionSettings?.infiniteApproval,
        signer,
        overrides: _overrides
      });
    }

    const value = ethers.BigNumber.from(route.transactionRequest.value);

    let tx = {
      to: targetAddress,
      data: transactionRequest.data,
      ..._overrides
    } as ethers.utils.Deferrable<ethers.providers.TransactionRequest>;

    if (transactionRequest.routeType !== "SEND") {
      tx = {
        ...tx,
        value
      };
    }

    return await signer.sendTransaction(tx);
  }

  public async isRouteApproved({ route, sender }: IsRouteApproved): Promise<{
    isApproved: boolean;
    message: string;
  }> {
    this.validateInit();

    const { fromIsNative, fromChain, fromProvider, fromTokenContract } =
      this.validateRouteParams(route.params);
    const { targetAddress } = this.validateTransactionRequest(
      route.transactionRequest
    );

    const {
      params: { fromAmount }
    } = route;

    const amount = ethers.BigNumber.from(fromAmount);

    if (!fromIsNative) {
      const balance = await (fromTokenContract as ethers.Contract).balanceOf(
        sender
      );

      if (amount.gt(balance)) {
        throw new SquidError({
          message: `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`,
          errorType: ErrorType.ValidationError,
          logging: this.config.logging,
          logLevel: this.config.logLevel
        });
      }

      const allowance = await (fromTokenContract as ethers.Contract).allowance(
        sender,
        targetAddress
      );

      if (amount.gt(allowance)) {
        throw new SquidError({
          message: `Insufficient allowance for contract: ${targetAddress} on chain ${fromChain.chainId}`,
          errorType: ErrorType.ValidationError,
          logging: this.config.logging,
          logLevel: this.config.logLevel
        });
      }

      return {
        isApproved: true,
        message: `User has approved Squid to use ${fromAmount} of ${await (
          fromTokenContract as ethers.Contract
        ).symbol()}`
      };
    } else {
      const balance = await fromProvider.getBalance(sender);

      if (amount.gt(balance)) {
        throw new SquidError({
          message: `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`,
          errorType: ErrorType.ValidationError,
          logging: this.config.logging,
          logLevel: this.config.logLevel
        });
      }

      return {
        isApproved: true,
        message: `User has the expected balance ${fromAmount} of ${fromChain.nativeCurrency.symbol}`
      };
    }
  }

  public async approveRoute({
    route,
    signer,
    executionSettings,
    overrides = {}
  }: ApproveRoute): Promise<boolean> {
    this.validateInit();

    const { fromIsNative, fromTokenContract } = this.validateRouteParams(
      route.params
    );

    const { targetAddress } = this.validateTransactionRequest(
      route.transactionRequest
    );

    const {
      params: { fromAmount }
    } = route as RouteData;

    if (fromIsNative) {
      return true;
    }

    let amountToApprove: BigNumber = ethers.BigNumber.from(uint256MaxValue);

    if (executionSettings?.infiniteApproval === false) {
      amountToApprove = ethers.BigNumber.from(fromAmount);
    }

    const approveTx = await (fromTokenContract as ethers.Contract)
      .connect(signer)
      .approve(targetAddress, amountToApprove, overrides);
    await approveTx.wait();

    return true;
  }

  public async allowance({
    owner,
    spender,
    tokenAddress,
    chainId
  }: Allowance): Promise<BigNumber> {
    this.validateInit();

    const token = getTokenData(
      this.tokens as TokenData[],
      tokenAddress,
      chainId
    );
    if (!token) {
      throw new SquidError({
        message: `Token not found for ${tokenAddress}`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const chain = getChainData(
      this.chains as ChainData[],
      token.chainId as number
    );
    if (!chain) {
      throw new SquidError({
        message: `Chain not found for ${token.chainId}`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const provider = new ethers.providers.JsonRpcProvider(chain.rpc);
    const contract = new ethers.Contract(token.address, erc20Abi, provider);
    return await contract.allowance(owner, spender);
  }

  public async approve({
    signer,
    spender,
    tokenAddress,
    amount,
    chainId,
    overrides
  }: Approve): Promise<ethers.providers.TransactionResponse> {
    this.validateInit();

    const token = getTokenData(
      this.tokens as TokenData[],
      tokenAddress,
      chainId as number | string
    );
    if (!token) {
      throw new SquidError({
        message: `Token not found for ${tokenAddress}`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const chain = getChainData(
      this.chains as ChainData[],
      token.chainId as number | string
    );
    if (!chain) {
      throw new SquidError({
        message: `Chain not found for ${token.chainId}`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    const contract = new ethers.Contract(token.address, erc20Abi, signer);
    return await contract.approve(
      spender,
      amount || uint256MaxValue,
      overrides
    );
  }

  public async getStatus(params: GetStatus): Promise<StatusResponse> {
    const response = await this.axiosInstance.get("/v1/status", { params });

    const statusResponse: StatusResponse = parseStatusResponse(response);
    return statusResponse;
  }

  public async getTokenPrice({
    tokenAddress,
    chainId
  }: {
    tokenAddress: string;
    chainId: string | number;
  }) {
    const response = await this.axiosInstance.get("/v1/token-price", {
      params: { tokenAddress, chainId }
    });

    return response.data.price;
  }
}

export * from "./types";
