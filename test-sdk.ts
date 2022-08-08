import { BigNumber, ethers } from "ethers";

import * as dotenv from "dotenv";

import SquidSdk from './src'
import { Environments } from './src/types'
import { ChainName } from "./src/contants/chains";

dotenv.config();

const sendAmount: BigNumber = ethers.utils.parseEther("1"); //0.1 WETH
const aUSDC: BigNumber = ethers.utils.parseUnits("1", 6); // 1 aUSDC

const privateKey = process.env.privateKey!;
const ethRpcEndPoint = process.env.ethRpcEndPoint!;
const recipientAddress = process.env.recipientAddress!;
const provider = new ethers.providers.JsonRpcProvider(ethRpcEndPoint);

async function main() {
  const wallet = new ethers.Wallet(privateKey, provider);
  const squidSdk = new SquidSdk({ environment: Environments.LOCAL });

  // trade-send
  // const tx = await squidSdk.getTx({
  //   recipientAddress,
  //   srcChain: ChainName.ETHEREUM,
  //   srcTokenIn: 'WETH',
  //   srcInAmount: sendAmount,
  //   dstChain: ChainName.AVALANCHE,
  //   dstTokenOut: 'axlUSDC',
  //   slippage: 1,
  // })

  // trade-send-trade
  const tx = await squidSdk.getTx({
    recipientAddress,
    srcChain: ChainName.ETHEREUM,
    srcTokenIn: 'WETH',
    srcInAmount: sendAmount.toString(),
    dstChain: ChainName.AVALANCHE,
    dstTokenOut: 'WAVAX',
    slippage: 1,
  })

  // send-trade
  // const tx = await squidSdk.getTx({
  //   recipientAddress,
  //   srcChain: ChainName.ETHEREUM,
  //   srcTokenIn: 'aUSDC',
  //   srcInAmount: aUSDC,
  //   dstChain: ChainName.AVALANCHE,
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