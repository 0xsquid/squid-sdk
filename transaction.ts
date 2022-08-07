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

const wethSrcTokenAddress = process.env.WETHContractAddress as string;
const squidContractAddress = process.env.squidContractAddress!;
const privateKey = process.env.privateKey!;
const ethRpcEndPoint = process.env.ethRpcEndPoint!;
const baseUrl = process.env.baseUrl!;

// amounts
const ETH: BigNumber = ethers.utils.parseEther("1"); //0.1 WETH
const aUSDC: BigNumber = ethers.utils.parseUnits("1", 6); // 1 aUSDC

// test params
const recipientAddress = process.env.recipientAddress!;
const sendAmount = ETH;

//route types
const tradeSendUrl: string = `${baseUrl}/api/transaction?recipientAddress=${recipientAddress}&srcChain=Ethereum&srcTokenIn=WETH&srcInAmount=${sendAmount}&dstChain=Avalanche&dstTokenOut=axlUSDC&slippage=1`;
const tradeSendTradeUrl: string = `${baseUrl}/api/transaction?recipientAddress=${recipientAddress}&srcChain=Ethereum&srcTokenIn=WETH&srcInAmount=${sendAmount}&dstChain=Avalanche&dstTokenOut=WAVAX&slippage=1`;

interface tradeParams  {
    sourceChain: string
    sourceToken: string;

    destChain: string;
    destAddress: string;
    destToken: string,

    amount: BigNumber;
    slippage: number;
}

const testParams: tradeParams = {
    sourceChain: "Ethereum",
    sourceToken: "USDC",

    destChain: "Avalanche",
    destAddress: recipientAddress,
    destToken: "WAVAX",

    amount: aUSDC,
    slippage: 1,
}

const getSendTradeURL = (p: tradeParams) =>
    `${baseUrl}/api/transaction?recipientAddress=${p.destAddress}&srcChain=${p.sourceChain}&srcTokenIn=${p.sourceToken}&srcInAmount=${aUSDC}&dstChain=${p.destChain}&dstTokenOut=${p.destToken}&slippage=${p.slippage}`;


async function main() {
    executeSwap(getSendTradeURL(testParams))
}

async function executeSwap(_url: string) {
    // query squidswap calldata from webapp API
    console.log("build calldata from squid API: ", _url);
    const response = await axios.get(_url);
    console.log("route type: ", response.data.routeType);
    console.log("response: ", response.data);
    console.log(`dest gas: ${response.data.destChainGas}`);

    // query Axelar gas fee
    const sdk = new AxelarQueryAPI({ environment: "testnet" } as AxelarQueryAPIConfig);
    const gasFee = await sdk.estimateGasFee(
        EvmChain.ETHEREUM,
        EvmChain.AVALANCHE,
        GasToken.ETH,
        response.data.destChainGas
    );
    console.log(`Axelar gas fee: ${gasFee}`);

    // Check source token allowance
    const provider = new ethers.providers.JsonRpcProvider(ethRpcEndPoint);
    const srcTokenContract = new ethers.Contract(wethSrcTokenAddress, erc20Abi, provider);

    let wallet = new ethers.Wallet(privateKey, provider);
    const allowance = await srcTokenContract.allowance(wallet.address, squidContractAddress);
    if (allowance < sendAmount) {
        throw new Error(`approved amount ${allowance} is less than send amount ${sendAmount}`)
    }
    console.log(`source token allowance: ${allowance}`);

    // Construct transaction object with encoded data
    const tx: any = {
        to: squidContractAddress,
        data: response!.data.data,
        value: response!.data.gasReceiver ? BigInt(gasFee) : null, //this will need to be calculated, maybe by the api
    };

    // Sign and submit transaction
    let resp = await wallet.signTransaction(tx);
    const sentTxResponse = await wallet.sendTransaction(tx);
    const txReceipt = await sentTxResponse.wait(1);
    console.log(txReceipt);
}

main() // pass in different urls with query strings for route types
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        console.log(error.message)
        console.log(error.response.data.error)
        process.exit(1);
    });
