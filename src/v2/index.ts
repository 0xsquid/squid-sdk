import {
  ChainData,
  RouteRequest,
  Token,
  SquidData
} from "@0xsquid/squid-types";
import { ethers, UnsignedTransaction } from "ethers";

import { getChainData, getTokenData } from "./utils";
import HttpAdapter from "./adapter/httpAdapter";
import { nativeTokenConstant, uint256MaxValue } from "./constants";
import { ErrorType, SquidError } from "./error";
import {
  Config,
  RouteData,
  ApproveRoute,
  GetStatus,
  ExecuteRoute,
  RouteResponse,
  RouteParamsData,
  ValidateBalanceAndApproval,
  OverrideParams
} from "./types";
import erc20Abi from "./abi/erc20.json";

const baseUrl = "https://testnet.api.0xsquid.com/";

export class Squid {
  private httpInstance: HttpAdapter;

  public initialized = false;
  public config: Config;
  public tokens: Token[] = [] as Token[];
  public chains: ChainData[] = [] as ChainData[];
  public isInMaintenanceMode = false;
  public maintenanceMessage: string | undefined;

  constructor(config = {} as Config) {
    this.httpInstance = new HttpAdapter({
      baseUrl: config?.baseUrl || baseUrl,
      config,
      headers: {
        "x-integrator-id": config.integratorId || "squid-sdk"
      }
    });

    this.config = {
      baseUrl: config?.baseUrl || baseUrl,
      ...config
    };
  }

  public setConfig(config: Config) {
    this.httpInstance = new HttpAdapter({
      baseUrl: config?.baseUrl || baseUrl,
      config,
      headers: {
        "x-integrator-id": config.integratorId || "squid-sdk"
      }
    });
    this.config = {
      baseUrl: config?.baseUrl || baseUrl,
      ...config
    };
  }

  public async init() {
    const response = await this.httpInstance.get("v2/sdk-info");

    if (response.status != 200) {
      throw new SquidError({
        message: `SDK initialization failed`,
        errorType: ErrorType.InitError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    this.tokens = response.data.tokens;
    this.chains = response.data.chains;
    this.isInMaintenanceMode = response.data.isInMaintenanceMode;
    this.maintenanceMessage = response.data.maintenanceMessage;
    this.initialized = true;
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

  public async getRoute(params: RouteRequest): Promise<RouteResponse> {
    this.validateInit();

    const response = await this.httpInstance.get("v2/route", {
      params
    });

    if (response.status != 200) {
      response.data.error;
      throw new SquidError({
        message: response.data.error,
        errorType: ErrorType.RouteResponseError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }

    return response.data;
  }

  public async executeRoute({
    signer,
    route,
    executionSettings,
    overrides
  }: ExecuteRoute): Promise<ethers.providers.TransactionResponse> {
    this.validateInit();
    this.validateTransactionRequest(route);

    const { fromIsNative, fromChain, fromTokenContract, fromProvider } =
      this.validateRouteParams(route.params);

    const { transactionRequest, params } = route;
    const { target, value } = route.transactionRequest;

    const gasData = this.getGasData({
      transactionRequest: route.transactionRequest,
      overrides
    });

    if (!fromIsNative) {
      await this.validateBalanceAndApproval({
        route,
        fromTokenContract: fromTokenContract as ethers.Contract,
        targetAddress: target,
        fromProvider,
        fromIsNative,
        fromAmount: params.fromAmount,
        fromChain,
        infiniteApproval: executionSettings?.infiniteApproval,
        signer,
        overrides: gasData
      });
    }

    const tx = {
      to: target,
      data: transactionRequest.data,
      value,
      ...gasData
    } as ethers.utils.Deferrable<ethers.providers.TransactionRequest>;

    return await signer.sendTransaction(tx);
  }

  public getRawTxHex({
    nonce,
    route,
    overrides
  }: Omit<ExecuteRoute, "signer"> & { nonce: number }): string {
    if (!route.transactionRequest) {
      throw new SquidError({
        message: `transactionRequest property is missing in route object`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
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

  public async isRouteApproved({
    route,
    sender
  }: {
    route: RouteData;
    sender: string;
  }): Promise<{
    isApproved: boolean;
    message: string;
  }> {
    this.validateInit();
    this.validateTransactionRequest(route);

    const { fromIsNative, fromChain, fromProvider, fromTokenContract } =
      this.validateRouteParams(route.params);

    const {
      params: { fromAmount }
    } = route;

    const sourceAmount = BigInt(fromAmount);

    if (fromIsNative) {
      const balance = BigInt(
        (await fromProvider.getBalance(sender)).toString()
      );

      if (sourceAmount > balance) {
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
    } else {
      const balance = BigInt(
        (
          await (fromTokenContract as ethers.Contract).balanceOf(sender)
        ).toString()
      );

      if (sourceAmount > balance) {
        throw new SquidError({
          message: `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`,
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
    }
  }

  public async approveRoute({
    route,
    signer,
    executionSettings,
    overrides = {}
  }: ApproveRoute): Promise<boolean> {
    this.validateInit();
    this.validateTransactionRequest(route);

    const { target } = route.transactionRequest;
    const { fromAmount } = route.params;

    const { fromIsNative, fromTokenContract } = this.validateRouteParams(
      route.params
    );

    if (fromIsNative) {
      return true;
    }

    let amountToApprove = BigInt(uint256MaxValue);

    if (executionSettings?.infiniteApproval === false) {
      amountToApprove = BigInt(fromAmount);
    }

    const approveTx = await (fromTokenContract as ethers.Contract)
      .connect(signer)
      .approve(target, amountToApprove, overrides);
    await approveTx.wait();

    return true;
  }

  public async getStatus(params: GetStatus): Promise<any> {
    const response = await this.httpInstance.axios.get("/v1/status", {
      params,
      headers: {
        ...(this.httpInstance.axios.defaults.headers.common &&
          this.httpInstance.axios.defaults.headers.common),
        ...(params.requestId && { "x-request-id": params.requestId }),
        ...(params.integratorId && { "x-integrator-id": params.integratorId })
      }
    });

    return response.data;
  }

  private getGasData = ({
    transactionRequest,
    overrides
  }: {
    transactionRequest: SquidData;
    overrides: OverrideParams | undefined;
  }) => {
    const { gasLimit, gasPrice, maxPriorityFeePerGas, maxFeePerGas } =
      transactionRequest;

    const gasParams = {
      gasLimit,
      gasPrice,
      maxPriorityFeePerGas,
      maxFeePerGas
    };

    return overrides ? { ...gasParams, ...overrides } : gasParams;
  };

  // validation helpers
  private async validateBalanceAndApproval({
    route,
    fromTokenContract,
    fromAmount,
    fromIsNative,
    targetAddress,
    signer,
    infiniteApproval,
    overrides
  }: ValidateBalanceAndApproval) {
    const sourceAmount = BigInt(fromAmount);
    let address: string;

    // get address from differents ethers instances
    if (signer && ethers.Signer.isSigner(signer)) {
      address = await (signer as ethers.Signer).getAddress();
    } else {
      address = (signer as ethers.Wallet).address;
    }

    // validate balance
    this.isRouteApproved({ route, sender: address });

    // approve token spent if necessary
    if (!fromIsNative) {
      const allowance = BigInt(
        (await fromTokenContract.allowance(address, targetAddress)).toString()
      );

      if (sourceAmount > allowance) {
        let amountToApprove = BigInt(uint256MaxValue);

        if (
          this.config?.executionSettings?.infiniteApproval === false &&
          !infiniteApproval === false
        ) {
          amountToApprove = sourceAmount;
        }

        const approveTx = await fromTokenContract
          .connect(signer)
          .approve(targetAddress, amountToApprove, overrides);
        await approveTx.wait();
      }
    }
  }

  private validateRouteParams(params: RouteRequest): RouteParamsData {
    const { fromChain, toChain, fromToken, toToken } = params;

    const _fromChain = getChainData(
      this.chains as ChainData[],
      fromChain,
      this.config
    );

    const _toChain = getChainData(
      this.chains as ChainData[],
      toChain,
      this.config
    );

    const _fromToken = getTokenData(
      this.tokens,
      fromToken,
      fromChain,
      this.config
    );

    const _toToken = getTokenData(this.tokens, toToken, toChain, this.config);

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
      fromChain: _fromChain,
      toChain: _toChain,
      fromToken: _fromToken,
      toToken: _toToken,
      fromTokenContract,
      fromProvider,
      fromIsNative
    };
  }

  private validateTransactionRequest(route: RouteData) {
    if (!route.transactionRequest) {
      throw new SquidError({
        message: `transactionRequest param not found in route object`,
        errorType: ErrorType.ValidationError,
        logging: this.config.logging,
        logLevel: this.config.logLevel
      });
    }
  }
}

export * from "../types";
