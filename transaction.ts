import axios from "axios";
import { BigNumber, BytesLike, ethers } from "ethers";
import * as dotenv from "dotenv";
import erc20Abi from "./abi/erc20.json";
import {
  AxelarQueryAPI,
  AxelarQueryAPIConfig,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";

dotenv.config();

const sendAmount: BigNumber = ethers.utils.parseEther("0.1"); //0.1 WETH
const aUSDC: BigNumber = ethers.utils.parseUnits("20", 6); // 1 aUSDC

const wethSrcTokenAddress = process.env.WETHContractAddress as string;
const squidContractAddress = process.env.squidContractAddress!;
const privateKey = process.env.privateKey!;
const ethRpcEndPoint = process.env.ethRpcEndPoint!;
const recipientAddress = process.env.recipientAddress!;

//route types
const tradeSendUrl: string = `http://host.docker.internal:3000/api/transaction?recipientAddress=${recipientAddress}&srcChain=ethereum&srcTokenIn=WETH&srcInAmount=${sendAmount}&dstChain=avalanche&dstTokenOut=aUSDC&slippage=1`;
const tradeSendTradeUrl: string = `http://host.docker.internal:3000/api/transaction?recipientAddress=${recipientAddress}&srcChain=ethereum&srcTokenIn=WETH&srcInAmount=${sendAmount}&dstChain=avalanche&dstTokenOut=WAVAX&slippage=1`;
const sendTradeUrl: string = `http://host.docker.internal:3000/api/transaction?recipientAddress=${recipientAddress}&srcChain=ethereum&srcTokenIn=aUSDC&srcInAmount=${aUSDC}&dstChain=avalanche&dstTokenOut=WAVAX&slippage=1`;

async function main(_url: string) {
  console.log("starting script");
  console.log("calling: ", _url);
  const response = await axios.get(_url);
  console.log("route type: ", response.data.routeType);

  const provider = new ethers.providers.JsonRpcProvider(ethRpcEndPoint);

  let wallet = new ethers.Wallet(privateKey, provider);

  // Set AxelarQueryAPI
  const sdk = new AxelarQueryAPI({
    environment: "testnet",
  } as AxelarQueryAPIConfig);

  console.log(`Dest gas: ${response.data.destChainGas}`);
  const gasFee = await sdk.estimateGasFee(
    EvmChain.ETHEREUM,
    EvmChain.AVALANCHE,
    GasToken.ETH,
    response.data.destChainGas
  );

  console.log(`Gas Fee: ${gasFee}`);
  //Construct transaction object with encoded data
  const tx: any = {
    to: squidContractAddress,
    data: response!.data.data,
    value: response!.data.gasReceiver ? BigInt(5e6) : null, //this will need to be calculated, maybe by the api
  };

  const srcTokenContract = new ethers.Contract(
    wethSrcTokenAddress,
    erc20Abi,
    provider
  );

  //Check source token allowance
  const allowance = await srcTokenContract.allowance(
    wallet.address,
    squidContractAddress
  );
  console.log(`Source token allowance: ${allowance}`);
  if (allowance < sendAmount) {
    console.log(
      `Error: Approved amount ${allowance} is less than send amount ${sendAmount}`
    );
  } else {
    //sign and submit transaction
    let resp = await wallet.signTransaction(tx);
    const sentTxResponse = await wallet.sendTransaction(tx);
    const txReceipt = await sentTxResponse.wait(1);
    console.log(txReceipt);
  }
}
main(tradeSendUrl) // pass in different urls with query strings for route types
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
