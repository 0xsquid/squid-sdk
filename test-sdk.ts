import { BigNumber, ethers } from "ethers";

import * as dotenv from "dotenv";

import { Squid } from "./src";

dotenv.config();

const sendAmount: BigNumber = ethers.utils.parseEther("1"); // 0.1 WETH
const aUSDC: BigNumber = ethers.utils.parseUnits("100", 6); // 1 aUSDC

const privateKey = process.env.privateKey as string;
const ethereumRpcEndPoint = process.env.ethereumRpcEndPoint as string;
const provider = new ethers.providers.JsonRpcProvider(
  "https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9"
);

async function main() {
  const signer = new ethers.Wallet(
    "05628be03b65c6766668898da5b419a4669aa67891bbea16718a455874bce422",
    provider
  );
  const squidSdk = new Squid({ baseUrl: "http://localhost:3000" });

  await squidSdk.init();

  // console.log('> tokens: ', squidSdk.tokens)
  // console.log('> chains: ', squidSdk.chains)

  // trade-send
  const params = {
    recipientAddress: signer.address,
    sourceChainId: 3,
    sourceTokenAddress: "0x526f0a95edc3df4cbdb7bb37d4f7ed451db8e369",
    sourceAmount: aUSDC.toString(),
    destinationChainId: 43113,
    destinationTokenAddress: "0x57f1c63497aee0be305b8852b354cec793da43bb",
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
