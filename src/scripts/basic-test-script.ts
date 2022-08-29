import { BigNumber, ethers } from "ethers";
import * as dotenv from "dotenv";
import { Squid } from "./../index";

dotenv.config();

// const sendAmount: BigNumber = ethers.utils.parseEther("1"); // 0.1 WETH
const USDC: BigNumber = ethers.utils.parseUnits("102", 6); // 1 USDC

const privateKey = process.env.privateKey as string;
const ethereumRpcEndPoint = process.env.ethereumRpcEndPoint as string;
const provider = new ethers.providers.JsonRpcProvider(ethereumRpcEndPoint);

async function main() {
  const signer = new ethers.Wallet(privateKey, provider);
  const squidSdk = new Squid({ baseUrl: "http://localhost:3000" });

  await squidSdk.init();
  // console.log('> tokens: ', squidSdk.tokens)
  // console.log('> chains: ', squidSdk.chains)
  // trade-send
  const params = {
    recipientAddress: signer.address,
    sourceChainId: 1,
    sourceTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    sourceAmount: "102300000", // USDC.toString(),
    destinationChainId: 1284,
    destinationTokenAddress: "0xAcc15dC74880C9944775448304B263D191c6077F",
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
  //   sourceTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'USDC')?.address as string,
  //   sourceAmount: USDC,
  //   destinationChainId: 43114,
  //   destinationTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'axlUSDC')?.address as string,
  //   slippage: 1
  // }
  console.log("> params: ", params);

  const { route } = await squidSdk.getRoute(params);

  console.log("> rotue: ", route);
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
