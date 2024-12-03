/* eslint-disable no-case-declarations */
import {
  ChainflipDepositAddressData,
  ChainType,
  CosmosAddress,
  CosmosBalance,
  DepositAddressResponse,
  EvmWallet,
  OnChainExecutionData,
  RouteRequest,
  RouteResponse,
  SquidDataType,
  StatusResponse,
  Token,
  TokenBalance,
} from "./types";

import HttpAdapter from "./adapter/HttpAdapter";
import { Config, ExecuteRoute, GetStatus, TransactionResponses } from "./types";

import { CosmosHandler, EvmHandler } from "./handlers";
import { TokensChains } from "./utils/TokensChains";

import { getCosmosChainsForChainIds } from "./utils/cosmos";
import { getChainRpcUrls, getEvmTokensForChainIds } from "./utils/evm";
import { isValidNumber } from "./utils/numbers";

const baseUrl = "https://testnet.api.squidrouter.com/";

export class Squid extends TokensChains {
  private httpInstance: HttpAdapter;
  private handlers = {
    evm: new EvmHandler(),
    cosmos: new CosmosHandler(),
  };

  public initialized = false;
  public config: Config;
  public isInMaintenanceMode = false;
  public maintenanceMessage: string | undefined;
  public axelarscanURL: string | undefined;

  constructor(config = {} as Config) {
    super();

    if (!config.integratorId) {
      throw new Error("integratorId required");
    }

    this.httpInstance = new HttpAdapter({
      baseUrl: config?.baseUrl || baseUrl,
      config,
      headers: {
        "x-integrator-id": config.integratorId,
      },
      timeout: config.timeout,
    });

    this.config = {
      baseUrl: config?.baseUrl || baseUrl,
      ...config,
    };
  }

  setConfig(config: Config) {
    this.httpInstance = new HttpAdapter({
      baseUrl: config?.baseUrl || baseUrl,
      config,
      headers: {
        "x-integrator-id": config.integratorId || "squid-sdk",
      },
      timeout: config.timeout,
    });
    this.config = {
      baseUrl: config?.baseUrl || baseUrl,
      ...config,
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
    this.axelarscanURL = response.data.axlScanUrl;
    this.initialized = true;
  }

  // PUBLIC METHODS

  async getStatus(params: GetStatus): Promise<StatusResponse> {
    const { data, headers } = await this.httpInstance.axios.get("/v2/status", {
      params,
      headers: {
        ...(this.httpInstance.axios.defaults.headers.common &&
          this.httpInstance.axios.defaults.headers.common),
        ...(params.requestId && { "x-request-id": params.requestId }),
        ...(params.integratorId && { "x-integrator-id": params.integratorId }),
      },
    });

    const requestId =
      headers && "x-request-id" in headers ? (headers["x-request-id"] as string) : undefined;
    const integratorId =
      headers && "x-integrator-id" in headers ? (headers["x-integrator-id"] as string) : undefined;

    return { ...data, requestId, integratorId };
  }

  async getRoute(params: RouteRequest): Promise<RouteResponse> {
    this.validateInit();

    const { data, headers, status } = await this.httpInstance.post("v2/route", params);

    if (status != 200) {
      throw new Error(data.error);
    }

    const requestId =
      headers && "x-request-id" in headers ? (headers["x-request-id"] as string) : undefined;
    const integratorId =
      headers && "x-integrator-id" in headers ? (headers["x-integrator-id"] as string) : undefined;

    return { ...data, requestId, integratorId };
  }

  async executeRoute(data: ExecuteRoute): Promise<TransactionResponses> {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    switch (data.route.transactionRequest?.type) {
      case SquidDataType.OnChainExecution:
        return await this.executeOnChainTx(data);

      case SquidDataType.ChainflipDepositAddress:
        return await this.requestDepositAddress(data);

      default:
        throw new Error(
          `Unsupported transaction request type - ${data.route.transactionRequest?.type}`,
        );
    }
  }

  private async executeOnChainTx(data: ExecuteRoute): Promise<TransactionResponses> {
    const fromChain = this.getChainData(data.route.params.fromChain);
    switch (fromChain.chainType) {
      case ChainType.EVM:
        const evmParams = this.handlers.evm.populateRouteParams(
          this,
          data.route.params,
          data.signer as EvmWallet,
        );

        return this.handlers.evm.executeRoute({
          data,
          params: evmParams,
        });

      case ChainType.COSMOS:
        const cosmosParams = this.handlers.cosmos.populateRouteParams(this, data.route.params);

        return this.handlers.cosmos.executeRoute({
          data,
          params: cosmosParams,
        });

      default:
        throw new Error(`Method not supported given chain type ${fromChain.chainType}`);
    }
  }

  private async requestDepositAddress(route: ExecuteRoute): Promise<TransactionResponses> {
    const depositAddressRequest = route.route.transactionRequest as ChainflipDepositAddressData;

    // request deposit address from api
    const { data, status } = await this.httpInstance.post(
      "v2/deposit-address",
      depositAddressRequest,
    );

    if (status != 200) {
      throw new Error(data.error);
    }

    return data as DepositAddressResponse;
  }

  async isRouteApproved({
    route,
    sender,
  }: {
    route: RouteResponse["route"];
    sender: string;
  }): Promise<{
    isApproved: boolean;
    message: string;
  }> {
    this.validateInit();
    this.validateTransactionRequest(route);

    const fromChain = this.getChainData(route.params.fromChain);
    switch (fromChain.chainType) {
      case ChainType.EVM:
        const params = this.handlers.evm.populateRouteParams(this, route.params);

        return await this.handlers.evm.isRouteApproved({
          sender,
          params,
          target: (route.transactionRequest as OnChainExecutionData).target,
        });

      default:
        throw new Error(`Method not supported given chain type ${fromChain.chainType}`);
    }
  }

  async approveRoute(data: ExecuteRoute): Promise<boolean> {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    const fromChain = this.getChainData(data.route.params.fromChain);
    switch (fromChain.chainType) {
      case ChainType.EVM:
        const params = this.handlers.evm.populateRouteParams(
          this,
          data.route.params,
          data.signer as EvmWallet,
        );

        return this.handlers.evm.approveRoute({ data, params });

      default:
        throw new Error(`Method not supported given chain type ${fromChain.chainType}`);
    }
  }

  public getRawTxHex(data: Omit<ExecuteRoute, "signer"> & { nonce: number }): string {
    this.validateInit();
    this.validateTransactionRequest(data.route);

    return this.handlers.evm.getRawTxHex({ ...data });
  }

  public async getTokenPrice({
    tokenAddress,
    chainId,
  }: {
    tokenAddress: string;
    chainId: string;
  }): Promise<number> {
    const response = await this.httpInstance.axios.get("/v2/tokens", {
      params: { address: tokenAddress, chainId, usdPrice: true },
    });

    const token = response.data.tokens.find(
      (t: Token) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
    );

    if (!token || !isValidNumber(token.usdPrice)) {
      throw new Error(
        `Valid token price not found for address ${tokenAddress} on chain ${chainId}`,
      );
    }

    return Number(token.usdPrice);
  }

  /**
   * Return tokens with USD price
   * If chainId is provided, it will return only tokens for that chain
   * if not, it will return all tokens
   * @param {chainId?: string}
   * @returns {Promise<Token[]>}
   */
  public async getMultipleTokensPrice({ chainId }: { chainId?: string }): Promise<Token[]> {
    const response = await this.httpInstance.axios.get("/v2/tokens", {
      params: {
        ...(chainId && { chainId }), // only add chainId to params if it's defined
        usdPrice: true,
      },
    });

    return response.data.tokens.filter((token: Token) => isValidNumber(token.usdPrice));
  }

  public async getFromAmount({
    fromToken,
    toAmount,
    toToken,
    slippagePercentage = 1.5,
  }: {
    fromToken: Token;
    toToken: Token;
    toAmount: string;
    slippagePercentage?: number;
  }): Promise<string> {
    // if there is an error getting real-time prices,
    // use the price at the time of initialization
    const [fromTokenPrice = fromToken.usdPrice ?? 0, toTokenPrice = toToken.usdPrice ?? 0] =
      await Promise.all([
        this.getTokenPrice({
          chainId: fromToken.chainId,
          tokenAddress: fromToken.address,
        }),
        this.getTokenPrice({
          chainId: toToken.chainId,
          tokenAddress: toToken.address,
        }),
      ]);

    // example fromAmount: 10
    const fromAmount = (toTokenPrice * Number(toAmount ?? 0)) / fromTokenPrice;

    // fromAmount (10) * slippagePercentage (1.5) / 100 = 0.15
    const slippage = fromAmount * (slippagePercentage / 100);

    // fromAmount (10) + slippage (0.15) = 10.15
    const fromAmountPlusSlippage = fromAmount + slippage;

    return fromAmountPlusSlippage.toString();
  }

  public async getEvmBalances({
    userAddress,
    chains = [],
  }: {
    userAddress: string;
    chains?: (string | number)[];
  }): Promise<TokenBalance[]> {
    const chainRpcUrls = getChainRpcUrls({
      chains: this.chains,
    });

    const tokens = getEvmTokensForChainIds({
      chainIds: chains,
      tokens: this.tokens,
    });

    return this.handlers.evm.getBalances(tokens, userAddress, chainRpcUrls);
  }

  public async getCosmosBalances({
    addresses,
    chainIds = [],
  }: {
    addresses: CosmosAddress[];
    chainIds?: (string | number)[];
  }): Promise<CosmosBalance[]> {
    const cosmosChains = getCosmosChainsForChainIds({
      chainIds,
      chains: this.chains,
    });

    return this.handlers.cosmos.getBalances({
      addresses,
      cosmosChains,
    });
  }

  public async getAllBalances({
    chainIds = [],
    cosmosAddresses,
    evmAddress,
  }: {
    chainIds?: (string | number)[];
    cosmosAddresses?: CosmosAddress[];
    evmAddress?: string;
  }): Promise<{
    cosmosBalances?: CosmosBalance[];
    evmBalances?: TokenBalance[];
  }> {
    const normalizedChainIds = chainIds.map(String);

    // fetch balances for provided chains
    const [evmChainIds, cosmosChainIds] = this.chains.reduce(
      (cosmosAndEvmChains, chain) => {
        if (!normalizedChainIds.includes(String(chain.chainId))) {
          return cosmosAndEvmChains;
        }

        if (chain.chainType === ChainType.COSMOS) {
          cosmosAndEvmChains[1].push(chain.chainId);
        } else {
          cosmosAndEvmChains[0].push(chain.chainId);
        }
        return cosmosAndEvmChains;
      },

      [[], []] as [(string | number)[], (string | number)[]],
    );

    const evmBalances = evmAddress
      ? await this.getEvmBalances({
          chains: evmChainIds,
          userAddress: evmAddress,
        })
      : [];

    const cosmosBalances = cosmosAddresses
      ? await this.getCosmosBalances({
          addresses: cosmosAddresses,
          chainIds: cosmosChainIds,
        })
      : [];

    return {
      evmBalances,
      cosmosBalances,
    };
  }

  // INTERNAL PRIVATES METHODS

  private validateInit() {
    if (!this.initialized) {
      throw new Error("SquidSdk must be initialized! Please call the SquidSdk.init method");
    }
  }

  private validateTransactionRequest(route: RouteResponse["route"]) {
    if (!route.transactionRequest) {
      throw new Error("transactionRequest param not found in route object");
    }
  }
}
