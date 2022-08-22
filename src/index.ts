import {
  AxelarQueryAPI,
  AxelarQueryAPIConfig,
  EvmChain,
  GasToken
} from "@axelar-network/axelarjs-sdk";
import { BigNumber, ethers } from "ethers";
import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";

import {
  Allowance,
  Approve,
  ChainsData,
  Config,
  ExecuteRoute,
  GetRoute,
  GetRouteResponse,
  TokenData
} from "./types";

import erc20Abi from "./abi/erc20.json";
import { getChainData } from "./utils/getChainData";
import { getTokenData } from "./utils/getTokenData";
import { uint256MaxValue } from "./contants/infiniteApprove";

dotenv.config();

const baseUrl = process.env.baseUrl;

class Squid {
  private axiosInstance: AxiosInstance;

  public inited = false;
  public config: Config;
  public tokens: TokenData[] = {} as TokenData[];
  public chains: ChainsData = {} as ChainsData;

  constructor(config: Config) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || baseUrl,
      headers: {
        // 'api-key': config.apiKey
      }
    });
    this.config = config;
  }

  public async init() {
    let response;
    try {
      response = await this.axiosInstance.get("/api/sdk-info");
      this.tokens = response.data.data.tokens;
      this.chains = response.data.data.chains;
      this.inited = true;
    } catch (error) {
      new Error(`Squid inititalization failed ${error}`);
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

  public async getRoute(params: GetRoute): Promise<GetRouteResponse> {
    if (!this.inited) {
      throw new Error(
        "Squid must be inited! Please call the Squid.init method"
      );
    }

    const response = await this.axiosInstance.get("/api/route", { params });

    return {
      route: response.data.route
    };
  }

  public async executeRoute({
    signer,
    route,
    config
  }: ExecuteRoute): Promise<ethers.providers.TransactionResponse> {
    const { transactionRequest, params } = route;

    if (!this.inited) {
      throw new Error(
        "Squid must be inited! Please call the Squid.init method"
      );
    }

    const sourceChain = getChainData(
      this.chains as ChainsData,
      params.sourceChainId
    );
    const sourceToken = getTokenData(
      this.tokens as TokenData[],
      params.sourceTokenAddress
    );
    const destinationChain = getChainData(
      this.chains as ChainsData,
      params.destinationChainId
    );

    if (!sourceChain) {
      throw new Error(`sourceChain not found for ${params.sourceChainId}`);
    }

    if (!sourceToken) {
      throw new Error(`sourceToken not found for ${params.sourceTokenAddress}`);
    }

    if (!destinationChain) {
      throw new Error(
        `destinationChain not found for ${params.destinationChainId}`
      );
    }

    const srcProvider = new ethers.providers.JsonRpcProvider(sourceChain.rpc);
    const srcTokenContract = new ethers.Contract(
      sourceToken.address,
      erc20Abi,
      srcProvider
    );

    const sourceAmount = BigInt(params.sourceAmount);
    const balance = await srcTokenContract.balanceOf(signer.address);

    if (balance < BigInt(params.sourceAmount)) {
      throw new Error(
        `Insufficent funds for account: ${signer.address} on ${params.sourceChainId}`
      );
    }

    const allowance = await srcTokenContract.allowance(
      signer.address,
      sourceChain.squidContracts.squidMain
    );

    if (allowance < sourceAmount) {
      const amountToApprove = config?.infiniteApprove
        ? uint256MaxValue
        : this.config.infiniteApprove
        ? uint256MaxValue
        : sourceAmount;

      const approveTx = await srcTokenContract
        .connect(signer)
        .approve(sourceChain.squidContracts.squidMain, amountToApprove);
      await approveTx.wait();
    }

    const sdk = new AxelarQueryAPI({
      environment: this.config.environment as string
    } as AxelarQueryAPIConfig);

    let gasFee;
    try {
      gasFee = await sdk.estimateGasFee(
        sourceChain?.nativeCurrency.name as EvmChain,
        destinationChain?.nativeCurrency.name as EvmChain,
        GasToken.ETH,
        transactionRequest.destinationChainGas
      );
    } catch (error) {
      // TODO: we need a backup
      console.warn("error: fetching gasFee:", error);
      gasFee = 3e7;
    }

    const tx = {
      to: sourceChain.squidContracts.squidMain,
      data: transactionRequest.data,
      value: BigInt(gasFee) // this will need to be calculated, maybe by the api, also standarice usage of this kind of values
    };

    await signer.signTransaction(tx);
    return await signer.sendTransaction(tx);
  }

  public async allowance(params: Allowance): Promise<BigNumber> {
    const { owner, spender, tokenAddress } = params;

    const token = getTokenData(this.tokens as TokenData[], tokenAddress);
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

  public async approve(
    params: Approve
  ): Promise<ethers.providers.TransactionResponse> {
    const { signer, spender, tokenAddress, amount } = params;

    const token = getTokenData(this.tokens as TokenData[], tokenAddress);
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

    const contract = new ethers.Contract(token.address, erc20Abi, signer);
    return await contract.approve(spender, amount || uint256MaxValue);
  }
}

export default Squid;
