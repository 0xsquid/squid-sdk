import { ChainType, RouteRequest } from "@0xsquid/squid-types";
import { ethers } from "ethers";

import HttpAdapter from "./adapter/HttpAdapter";
import { nativeTokenConstant } from "./constants";
import {
  Config,
  RouteData,
  GetStatus,
  ExecuteRoute,
  RouteParamsPopulated
} from "./types";

import erc20Abi from "./abi/erc20.json";
import { TokensChains } from "./TokensChains";
import { EvmHandler } from "./handlers";

const baseUrl = "https://testnet.api.0xsquid.com/";

export class Squid extends TokensChains {
  private httpInstance: HttpAdapter;
  private handlers = {
    evm: new EvmHandler()
  };

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
      throw new Error("SDK initialization failed");
    }

    this.tokens = response.data.tokens;
    this.chains = response.data.chains;
    this.isInMaintenanceMode = response.data.isInMaintenanceMode;
    this.maintenanceMessage = response.data.maintenanceMessage;
    this.initialized = true;
  }

  // PUBLIC METHODS

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

  async getRoute(params: RouteRequest): Promise<RouteData> {
    this.validateInit();

    const response = await this.httpInstance.get("v2/route", {
      params
    });

    if (response.status != 200) {
      throw new Error(response.data.error);
    }

    return response.data;
  }

  async executeRoute(
    data: ExecuteRoute
  ): Promise<ethers.providers.TransactionResponse> {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    const params = await this.populateRouteParams(data.route.params);

    switch (params.fromChain.chainType) {
      case ChainType.EVM:
        return this.handlers.evm.executeRoute({ data, params });

      case ChainType.COSMOS:
        throw new Error("not implemented");

      default:
        throw new Error("not supported");
    }
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

    const params = await this.populateRouteParams(route.params);

    switch (params.fromChain.chainType) {
      case ChainType.EVM:
        return this.handlers.evm.isRouteApproved({ sender, params });

      case ChainType.COSMOS:
        throw new Error("not implemented");

      default:
        throw new Error("not supported");
    }
  }

  async approveRoute(data: ExecuteRoute): Promise<boolean> {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    const params = await this.populateRouteParams(data.route.params);

    switch (params.fromChain.chainType) {
      case ChainType.EVM:
        return this.handlers.evm.approveRoute({ data, params });

      case ChainType.COSMOS:
        throw new Error("not implemented");

      default:
        throw new Error("not supported");
    }
  }

  // INTERNAL PRIVATES METHODS

  private validateInit() {
    if (!this.initialized) {
      throw new Error(
        "SquidSdk must be initialized! Please call the SquidSdk.init method"
      );
    }
  }

  private populateRouteParams(params: RouteRequest): RouteParamsPopulated {
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

  private validateTransactionRequest(route: RouteData) {
    if (!route.transactionRequest) {
      throw new Error("transactionRequest param not found in route object");
    }
  }
}

export * from "../types";
