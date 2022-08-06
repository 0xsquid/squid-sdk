import {
  AxelarQueryAPI,
  AxelarQueryAPIConfig,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";
import axios, { AxiosInstance } from "axios";
import { BigNumber, ethers } from "ethers";
import * as dotenv from "dotenv";

import { Environments, IConfig, IGetTx, ITransaction } from './types'

import erc20Abi from "../abi/erc20.json";

dotenv.config();

const sendAmount: BigNumber = ethers.utils.parseEther("1"); //0.1 WETH
const aUSDC: BigNumber = ethers.utils.parseUnits("1", 6); // 1 aUSDC

const wethSrcTokenAddress = process.env.WETHContractAddress as string;
const squidContractAddress = process.env.squidContractAddress!;
const privateKey = process.env.privateKey!;
const ethRpcEndPoint = process.env.ethRpcEndPoint!;
const recipientAddress = process.env.recipientAddress!;
const baseUrl = process.env.baseUrl!;
const provider = new ethers.providers.JsonRpcProvider(ethRpcEndPoint);

class SquidSdk {
  private axiosInstance: AxiosInstance;
  private environment: Environments;

  constructor(config: IConfig) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        // 'api-key': config.apiKey 
      }
    });
    this.environment = config.environment
  }

  public async getTx(params: IGetTx): Promise<ITransaction> {
    const response = await this.axiosInstance.get('/api/transaction', {
      params
    });

    console.log("> Route type: ", response.data.routeType);
    console.log("> Response: ", response.data);
    console.log("> Destination gas: ", response.data.destChainGas);

    // Set AxelarQueryAPI, TODO: environment
    const sdk = new AxelarQueryAPI({
      environment: this.environment as string,
    } as AxelarQueryAPIConfig);

    const gasFee = await sdk.estimateGasFee(
      EvmChain.ETHEREUM,
      EvmChain.AVALANCHE,
      GasToken.ETH,
      response.data.destChainGas
    );

    console.log("> Gas Fee: ", gasFee);

    const srcTokenContract = new ethers.Contract(
      wethSrcTokenAddress,
      erc20Abi,
      provider
    );

    // Check source token allowance
    const allowance = await srcTokenContract.allowance(
      params.recipientAddress,
      squidContractAddress
    );

    console.log("> Source token allowance: ", allowance.toString());

    if (allowance < sendAmount) {
      throw new Error(`Error: Approved amount ${allowance} is less than send amount ${sendAmount}`);
    }

    // Construct transaction object with encoded data
    const tx: ITransaction = {
      to: squidContractAddress,
      data: response.data.data,
      value: BigInt(gasFee), // this will need to be calculated, maybe by the api
    };

    return tx;
  }
}

export default SquidSdk;

async function main() {
  const wallet = new ethers.Wallet(privateKey, provider);
  const squidSdk = new SquidSdk({ environment: Environments.LOCAL });

  // trade-send
  // const tx = await squidSdk.getTx({
  //   recipientAddress,
  //   srcChain: 'Ethereum',
  //   srcTokenIn: 'WETH',
  //   srcInAmount: sendAmount,
  //   dstChain: 'Avalanche',
  //   dstTokenOut: 'axlUSDC',
  //   slippage: 1,
  // })

  // trade-send-trade
  const tx = await squidSdk.getTx({
    recipientAddress,
    srcChain: 'Ethereum',
    srcTokenIn: 'WETH',
    srcInAmount: sendAmount.toString(),
    dstChain: 'Avalanche',
    dstTokenOut: 'WAVAX',
    slippage: 1,
  })

  // send-trade
  // const tx = await squidSdk.getTx({
  //   recipientAddress,
  //   srcChain: 'Ethereum',
  //   srcTokenIn: 'aUSDC',
  //   srcInAmount: aUSDC,
  //   dstChain: 'Avalanche',
  //   dstTokenOut: 'axlUSDC',
  //   slippage: 1,
  // })

  console.log("> tx: ", tx);

  const signTxResponse = await wallet.signTransaction(tx as any);
  console.log("> signTxResponse: ", signTxResponse);
  const sentTxResponse = await wallet.sendTransaction(tx as any);
  console.log("> sentTxResponse: ", sentTxResponse.hash);
  const txReceipt = await sentTxResponse.wait(1);
  console.log("> txReceipt: ", txReceipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("> error: ", error);
    console.log("> error message: ", error.message);
    console.log("> error response: ", error.response.data.error);
    process.exit(1);
  });