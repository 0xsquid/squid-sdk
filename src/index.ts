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
    srcTokenContract,
    sourceAmount,
    sourceIsNative,
    targetAddress,
    srcProvider,
    sourceChain,
    signer,
    infiniteApproval
  }: ValidateBalanceAndApproval) {
    const _sourceAmount = ethers.BigNumber.from(sourceAmount);
    let address;
    if (signer && ethers.Signer.isSigner(signer)) {
      address = await (signer as ethers.Signer).getAddress();
    } else {
      address = (signer as ethers.Wallet).address;
    }

    if (!sourceIsNative) {
      const balance = await srcTokenContract.balanceOf(address);

      if (_sourceAmount.gt(balance)) {
        throw new Error(
          `Insufficent funds for account: ${address} on chain ${sourceChain.chainId}`
        );
      }

      const allowance = await srcTokenContract.allowance(
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

        const approveTx = await srcTokenContract
          .connect(signer)
          .approve(targetAddress, amountToApprove);
        await approveTx.wait();
      }
    } else {
      const balance = await srcProvider.getBalance(address);

      if (_sourceAmount.gt(balance)) {
        throw new Error(
          `Insufficent funds for account: ${address} on chain ${sourceChain.chainId}`
        );
      }
    }
  }

  private validateRouteData(route: Route): RoutePopulatedData {
    const {
      params: {
        sourceChainId,
        destinationChainId,
        sourceTokenAddress,
        destinationTokenAddress
      },
      transactionRequest: { targetAddress }
    } = route;

    const sourceChain = getChainData(this.chains as ChainsData, sourceChainId);
    const destinationChain = getChainData(
      this.chains as ChainsData,
      destinationChainId
    );
    if (!sourceChain) {
      throw new Error(`sourceChain not found for ${sourceChainId}`);
    }
    if (!destinationChain) {
      throw new Error(`destinationChain not found for ${destinationChainId}`);
    }

    const srcProvider = new ethers.providers.JsonRpcProvider(sourceChain.rpc);
    const sourceToken = getTokenData(
      this.tokens,
      sourceTokenAddress,
      sourceChainId
    );
    const destinationToken = getTokenData(
      this.tokens,
      destinationTokenAddress,
      destinationChainId
    );

    const sourceIsNative = sourceTokenAddress === nativeTokenConstant;
    let srcTokenContract;

    if (!sourceIsNative) {
      srcTokenContract = new ethers.Contract(
        sourceTokenAddress,
        erc20Abi,
        srcProvider
      );
    }

    return {
      sourceChain,
      destinationChain,
      sourceToken,
      destinationToken,
      srcTokenContract,
      srcProvider,
      sourceIsNative,
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
      sourceIsNative,
      sourceChain,
      destinationChain,
      srcTokenContract,
      srcProvider,
      targetAddress
    } = this.validateRouteData(route);

    if (!sourceIsNative) {
      await this.validateBalanceAndApproval({
        srcTokenContract: srcTokenContract as ethers.Contract,
        targetAddress,
        srcProvider,
        sourceIsNative,
        sourceAmount: params.sourceAmount,
        sourceChain,
        infiniteApproval: executionSettings?.infiniteApproval,
        signer
      });
    }

    const sdk = new AxelarQueryAPI({
      environment:
        this.config?.baseUrl && !this.config.baseUrl.includes("testnet")
          ? "mainnet"
          : "testnet"
    } as AxelarQueryAPIConfig);

    let gasFee: string;
    try {
      gasFee = await sdk.estimateGasFee(
        sourceChain.nativeCurrency.name as EvmChain,
        destinationChain.nativeCurrency.name as EvmChain,
        destinationChain.nativeCurrency.symbol as GasToken,
        transactionRequest.destinationChainGas
      );
    } catch (error) {
      gasFee = "3513000021000000";
    }

    const value = sourceIsNative
      ? ethers.BigNumber.from(params.sourceAmount).add(
          ethers.BigNumber.from(gasFee)
        )
      : ethers.BigNumber.from(gasFee);

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
      sourceIsNative,
      sourceChain,
      srcProvider,
      srcTokenContract,
      targetAddress
    } = this.validateRouteData(route);

    const {
      params: { sourceAmount }
    } = route;

    const amount = ethers.BigNumber.from(sourceAmount);

    if (!sourceIsNative) {
      const balance = await (srcTokenContract as ethers.Contract).balanceOf(
        sender
      );

      if (amount.gt(balance)) {
        throw new Error(
          `Insufficent funds for account: ${sender} on chain ${sourceChain.chainId}`
        );
      }

      const allowance = await (srcTokenContract as ethers.Contract).allowance(
        sender,
        targetAddress
      );

      if (amount.gt(allowance)) {
        throw new Error(
          `Insufficent allowance for contract: ${targetAddress} on chain ${sourceChain.chainId}`
        );
      }

      return {
        isApproved: true,
        message: `User has approved Squid to use ${sourceAmount} of ${await (
          srcTokenContract as ethers.Contract
        ).symbol()}`
      };
    } else {
      const balance = await srcProvider.getBalance(sender);

      if (amount.gt(balance)) {
        throw new Error(
          `Insufficent funds for account: ${sender} on chain ${sourceChain.chainId}`
        );
      }

      return {
        isApproved: true,
        message: `User has the expected balance ${sourceAmount} of ${sourceChain.nativeCurrency.symbol}`
      };
    }
  }

  public async approveRoute({ route, signer }: ApproveRoute): Promise<boolean> {
    this.validateInit();

    const { sourceIsNative, srcTokenContract, targetAddress } =
      this.validateRouteData(route);

    const {
      params: { sourceAmount }
    } = route as Route;

    if (sourceIsNative) {
      return true;
    }

    let amountToApprove: BigNumber = ethers.BigNumber.from(uint256MaxValue);

    if (this.config?.executionSettings?.infiniteApproval === false) {
      amountToApprove = ethers.BigNumber.from(sourceAmount);
    }

    const approveTx = await (srcTokenContract as ethers.Contract)
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
}

export * from "./types";
