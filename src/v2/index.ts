import { RouteRequest } from "@0xsquid/squid-types";
import { ethers } from "ethers";

import HttpAdapter from "./adapter/HttpAdapter";
import { uint256MaxValue } from "./constants";
import { ErrorType, SquidError } from "./error";
import {
  Config,
  RouteData,
  ApproveRoute,
  GetStatus,
  ExecuteRoute,
  RouteResponse,
  ValidateBalanceAndApproval
} from "./types";

import { Utils } from "./utils";

const baseUrl = "https://testnet.api.0xsquid.com/";

export class Squid extends Utils {
  private httpInstance: HttpAdapter;

  public initialized = false;
  public config: Config;
  public isInMaintenanceMode = false;
  public maintenanceMessage: string | undefined;

  constructor(config = {} as Config) {
    super();
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

  setConfig(config: Config) {
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

  async init() {
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

  async getRoute(params: RouteRequest): Promise<RouteResponse> {
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

  async executeRoute({
    signer,
    route,
    executionSettings,
    overrides
  }: ExecuteRoute): Promise<ethers.providers.TransactionResponse> {
    this.validateInit();
    this.validateTransactionRequest(route);

    const { fromIsNative, fromChain, fromTokenContract, fromProvider } =
      this.populateRouteParams(route.params);

    const { transactionRequest, params } = route;
    const { target, value } = route.transactionRequest;

    const gasData = this.getGasData({
      transactionRequest: route.transactionRequest,
      overrides
    });

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

    const tx = {
      to: target,
      data: transactionRequest.data,
      value,
      ...gasData
    } as ethers.utils.Deferrable<ethers.providers.TransactionRequest>;

    return await signer.sendTransaction(tx);
  }

  async isRouteApproved({
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

    const {
      fromIsNative,
      fromChain,
      fromProvider,
      fromTokenContract,
      fromAmount
    } = this.populateRouteParams(route.params);

    const sourceAmount = BigInt(fromAmount);

    if (fromIsNative) {
      return await this.validateNativeBalance({
        fromProvider,
        sender,
        amount: sourceAmount,
        fromChain
      });
    } else {
      return await this.validateTokenBalance({
        amount: sourceAmount,
        fromTokenContract: fromTokenContract as ethers.Contract,
        fromChain,
        sender
      });
    }
  }

  async approveRoute({
    route,
    signer,
    executionSettings,
    overrides = {}
  }: ApproveRoute): Promise<boolean> {
    this.validateInit();
    this.validateTransactionRequest(route);

    const { target } = route.transactionRequest;
    const { fromAmount } = route.params;

    const { fromIsNative, fromTokenContract } = this.populateRouteParams(
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

  // TODO: ADD STATUS TYPE
  async getStatus(params: GetStatus): Promise<any> {
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

  async validateBalanceAndApproval({
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
    await this.isRouteApproved({ route, sender: address });

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
}

export * from "../types";
