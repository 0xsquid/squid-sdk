import { ChainType, RouteRequest, RouteResponse } from "@0xsquid/squid-types";

import HttpAdapter from "./adapter/HttpAdapter";
import { EthersAdapter } from "./adapter/EthersAdapter";
import { nativeTokenConstant } from "./constants";
import {
  Config,
  GetStatus,
  ExecuteRoute,
  RouteParamsPopulated,
  TransactionResponses
} from "./types";

import { TokensChains } from "./TokensChains";
import { EvmHandler, CosmosHandler } from "./handlers";

import erc20Abi from "./abi/erc20.json";
import { EvmWallet } from "types/ethers";

const baseUrl = "https://testnet.api.squidrouter.com/";

const ethersAdapter = new EthersAdapter();

export class Squid extends TokensChains {
  private httpInstance: HttpAdapter;
  private handlers = {
    evm: new EvmHandler(),
    cosmos: new CosmosHandler()
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

  async getRoute(params: RouteRequest): Promise<RouteResponse> {
    this.validateInit();

    const response = await this.httpInstance.post("v2/route", params);

    if (response.status != 200) {
      throw new Error(response.data.error);
    }

    return response.data;
  }

  async executeRoute(data: ExecuteRoute): Promise<TransactionResponses> {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    const params = this.populateRouteParams(
      data.route.params,
      data.signer as EvmWallet
    );

    switch (params.fromChain.chainType) {
      case ChainType.EVM:
        return this.handlers.evm.executeRoute({ data, params });

      case ChainType.COSMOS:
        return this.handlers.cosmos.executeRoute({ data, params });

      default:
        throw new Error(
          `Method not supported given chain type ${params.fromChain.chainType}`
        );
    }
  }

  async isRouteApproved({
    route,
    sender
  }: {
    route: RouteResponse["route"];
    sender: string;
  }): Promise<{
    isApproved: boolean;
    message: string;
  }> {
    this.validateInit();
    this.validateTransactionRequest(route);

    const params = this.populateRouteParams(route.params);

    switch (params.fromChain.chainType) {
      case ChainType.EVM:
        return await this.handlers.evm.isRouteApproved({
          sender,
          params,
          target: route.transactionRequest.target
        });

      default:
        throw new Error(
          `Method not supported given chain type ${params.fromChain.chainType}`
        );
    }
  }

  async approveRoute(data: ExecuteRoute): Promise<boolean> {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    const params = this.populateRouteParams(
      data.route.params,
      data.signer as EvmWallet
    );

    switch (params.fromChain.chainType) {
      case ChainType.EVM:
        return this.handlers.evm.approveRoute({ data, params });

      default:
        throw new Error(
          `Method not supported given chain type ${params.fromChain.chainType}`
        );
    }
  }

  // TODO: IS THIS METHOD GONNA BE EVM ONLY ?
  public getRawTxHex(
    data: Omit<ExecuteRoute, "signer"> & { nonce: number }
  ): string {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    return this.handlers.evm.getRawTxHex({ ...data });
  }

  // INTERNAL PRIVATES METHODS

  private validateInit() {
    if (!this.initialized) {
      throw new Error(
        "SquidSdk must be initialized! Please call the SquidSdk.init method"
      );
    }
  }

  private populateRouteParams(
    params: RouteRequest,
    signer?: EvmWallet
  ): RouteParamsPopulated {
    const { fromChain, toChain, fromToken, toToken } = params;

    const _fromChain = this.getChainData(fromChain);
    const _toChain = this.getChainData(toChain);
    const _fromToken = this.getTokenData(fromToken, fromChain);
    const _toToken = this.getTokenData(toToken, toChain);

    const fromProvider = ethersAdapter.rpcProvider(_fromChain.rpc);

    const fromIsNative = _fromToken.address === nativeTokenConstant;
    let fromTokenContract;

    if (!fromIsNative) {
      fromTokenContract = ethersAdapter.contract(
        _fromToken.address,
        erc20Abi,
        signer || fromProvider
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

  private validateTransactionRequest(route: RouteResponse["route"]) {
    if (!route.transactionRequest) {
      throw new Error("transactionRequest param not found in route object");
    }
  }
}
