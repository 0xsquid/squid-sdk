import { BigNumber, ethers } from "ethers";

import * as dotenv from "dotenv";

import { Squid } from "./src";

dotenv.config();

const sendAmount: BigNumber = ethers.utils.parseEther("1"); // 0.1 WETH
// const aUSDC: BigNumber = ethers.utils.parseUnits('1', 6) // 1 aUSDC

const privateKey = process.env.privateKey as string;
const ethereumRpcEndPoint = process.env.ethereumRpcEndPoint as string;
const provider = new ethers.providers.JsonRpcProvider(ethereumRpcEndPoint);

async function main() {
  const signer = new ethers.Wallet(privateKey, provider);
  const squidSdk = new Squid();

  await squidSdk.init();

  // console.log('> tokens: ', squidSdk.tokens)
  // console.log('> chains: ', squidSdk.chains)

  // trade-send
  const params = {
    recipientAddress: signer.address,
    sourceChainId: 1,
    sourceTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    sourceAmount: sendAmount.toString(),
    destinationChainId: 1284,
    destinationTokenAddress: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
    slippage: 1
  };

  // trade-send-trade
  // const params = {
  //   recipientAddress,
  //   sourceChainId: 1,
  //   sourceTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'WETH')
  //     ?.address as string,
  //   sourceAmount: sendAmount.toString(),
  //   destinationChainId: 43114,
  //   destinationTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'WAVAX')
  //     ?.address as string,
  //   slippage: 1
  // }

  // send-trade
  // const params = {
  //   recipientAddress,
  //   sourceChainId: 1,
  //   sourceTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'aUSDC')?.address as string,
  //   sourceAmount: aUSDC,
  //   destinationChainId: 43114,
  //   destinationTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'axlUSDC')?.address as string,
  //   slippage: 1
  // }

  console.log("> params: ", params);

  const { route } = await squidSdk.getRoute(params);

  const tx = await squidSdk.executeRoute({
    signer,
    route
  });

  const txReceipt = await tx.wait();

  console.log("> txReceipt: ", txReceipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("> error: ", error);
    console.log("> error message: ", error.message);
    console.log("> error response: ", error.response.data.error);
    process.exit(1);
  });
