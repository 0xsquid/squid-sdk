import {
  AxelarQueryAPI,
  AxelarQueryAPIConfig,
  EvmChain,
  GasToken
} from "@axelar-network/axelarjs-sdk";
import { BigNumber, ethers } from "ethers";
import axios, { AxiosInstance } from "axios";

import {
  Allowance,
  Approve,
  ApproveRoute,
  ChainsData,
  Config,
  ExecuteRoute,
  GetRoute,
  GetStatus,
  StatusResponse,
  RouteResponse,
  TokenData,
  IsRouteApproved,
  Route,
  RoutePopulatedData,
  ValidateBalanceAndApproval,
  ChainData
} from "./types";

import erc20Abi from "./abi/erc20.json";
import { getChainData } from "./utils/getChainData";
import { getTokenData } from "./utils/getTokenData";
import { nativeTokenConstant, uint256MaxValue } from "./constants";

const baseUrl = "https://testnet.api.0xsquid.com/";

export class Squid {
  private axiosInstance: AxiosInstance;

  public initialized = false;
  public config: Config | undefined;
  public tokens: TokenData[] = [] as TokenData[];
  public chains: ChainsData = [] as ChainData[];

  constructor(config = {} as Config) {
    this.axiosInstance = axios.create({
      baseURL: config?.baseUrl || baseUrl,
      headers: {
        // 'api-key': config.apiKey
      }
    });

    this.config = {
      baseUrl: config?.baseUrl || baseUrl,
      ...config
    };
  }

  private validateInit() {
    if (!this.initialized) {
      throw new Error(
        "SquidSdk must be initialized! Please call the SquidSdk.init method"
      );
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
    infiniteApproval
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
        throw new Error(
          `Insufficent funds for account: ${address} on chain ${fromChain.chainId}`
        );
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
          .approve(targetAddress, amountToApprove);
        await approveTx.wait();
      }
    } else {
      const balance = await fromProvider.getBalance(address);

      if (_sourceAmount.gt(balance)) {
        throw new Error(
          `Insufficent funds for account: ${address} on chain ${fromChain.chainId}`
        );
      }
    }
  }

  private validateRouteData(route: Route): RoutePopulatedData {
    const {
      params: { fromChain, toChain, fromToken, toToken },
      transactionRequest: { targetAddress }
    } = route;

    const _fromChain = getChainData(
      this.chains as ChainsData,
      route.params.fromChain
    );
    const _toChain = getChainData(this.chains as ChainsData, toChain);
    if (!_fromChain) {
      throw new Error(`fromChain not found for ${fromChain}`);
    }
    if (!_toChain) {
      throw new Error(`toChain not found for ${toChain}`);
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
      fromIsNative,
      targetAddress
    };
  }

  public async init() {
    try {
      const response = await this.axiosInstance.get("/api/sdk-info");
      this.tokens = response.data.data.tokens;
      this.chains = response.data.data.chains;
      this.initialized = true;
    } catch (error) {
      throw new Error(`Squid inititalization failed ${error}`);
    }
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
    const response = await this.axiosInstance.get("/api/route", { params });
    return { route: response.data.route };
  }

  public async executeRoute({
    signer,
    route,
    executionSettings
  }: ExecuteRoute): Promise<ethers.providers.TransactionResponse> {
    this.validateInit();

    const { transactionRequest, params } = route;

    const {
      fromIsNative,
      fromChain,
      toChain,
      fromTokenContract,
      fromProvider,
      targetAddress
    } = this.validateRouteData(route);

    if (!fromIsNative) {
      await this.validateBalanceAndApproval({
        fromTokenContract: fromTokenContract as ethers.Contract,
        targetAddress,
        fromProvider,
        fromIsNative,
        fromAmount: params.fromAmount,
        fromChain,
        infiniteApproval: executionSettings?.infiniteApproval,
        signer
      });
    }

    const value = ethers.BigNumber.from(route.transactionRequest.value);

    let tx = {
      to: targetAddress,
      data: transactionRequest.data,
      gasLimit: 70e4 // 700000 gasLimit
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

    const {
      fromIsNative,
      fromChain,
      fromProvider,
      fromTokenContract,
      targetAddress
    } = this.validateRouteData(route);

    const {
      params: { fromAmount }
    } = route;

    const amount = ethers.BigNumber.from(fromAmount);

    if (!fromIsNative) {
      const balance = await (fromTokenContract as ethers.Contract).balanceOf(
        sender
      );

      if (amount.gt(balance)) {
        throw new Error(
          `Insufficent funds for account: ${sender} on chain ${fromChain.chainId}`
        );
      }

      const allowance = await (fromTokenContract as ethers.Contract).allowance(
        sender,
        targetAddress
      );

      if (amount.gt(allowance)) {
        throw new Error(
          `Insufficent allowance for contract: ${targetAddress} on chain ${fromChain.chainId}`
        );
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
        throw new Error(
          `Insufficent funds for account: ${sender} on chain ${fromChain.chainId}`
        );
      }

      return {
        isApproved: true,
        message: `User has the expected balance ${fromAmount} of ${fromChain.nativeCurrency.symbol}`
      };
    }
  }

  public async approveRoute({ route, signer }: ApproveRoute): Promise<boolean> {
    this.validateInit();

    const { fromIsNative, fromTokenContract, targetAddress } =
      this.validateRouteData(route);

    const {
      params: { fromAmount }
    } = route as Route;

    if (fromIsNative) {
      return true;
    }

    let amountToApprove: BigNumber = ethers.BigNumber.from(uint256MaxValue);

    if (this.config?.executionSettings?.infiniteApproval === false) {
      amountToApprove = ethers.BigNumber.from(fromAmount);
    }

    const approveTx = await (fromTokenContract as ethers.Contract)
      .connect(signer)
      .approve(targetAddress, amountToApprove);
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
      throw new Error("Unsupported token");
    }

    const chain = getChainData(
      this.chains as ChainsData,
      token?.chainId as number
    );
    if (!chain) {
      throw new Error("Unsupported chain");
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
    chainId
  }: Approve): Promise<ethers.providers.TransactionResponse> {
    this.validateInit();

    const token = getTokenData(
      this.tokens as TokenData[],
      tokenAddress,
      chainId as number | string
    );
    if (!token) {
      throw new Error("Unsupported token");
    }

    const chain = getChainData(
      this.chains as ChainsData,
      token?.chainId as number | string
    );
    if (!chain) {
      throw new Error("Unsupported chain");
    }

    const contract = new ethers.Contract(token.address, erc20Abi, signer);
    return await contract.approve(spender, amount || uint256MaxValue);
  }

  public async getStatus(params: GetStatus): Promise<StatusResponse> {
    const response = await this.axiosInstance.get("/api/status", { params });

    return response.data.data;
  }

  public async getTokenPrice({
    tokenAddress,
    chainId
  }: {
    tokenAddress: string;
    chainId: string | number;
  }) {
    const response = await this.axiosInstance.get("/api/token-price", {
      params: { tokenAddress, chainId }
    });

    return response.data.price;
  }
}

export * from "./types";
