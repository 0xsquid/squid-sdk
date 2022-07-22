import axios from "axios";
import { BigNumber, BytesLike, ethers } from "ethers";

const sendAmount: BigNumber = ethers.utils.parseEther('0.1'); //0.1 WETH
const aUSDC: BigNumber = ethers.utils.parseUnits("20", 6); // 1 aUSDC

//route types
const tradeSendUrl: string = `http://localhost:3000/api/transaction?recipientAddress=0x5F88eC396607Fc3edb0424E8E6061949e6b624e7&srcChain=ethereum&srcTokenIn=WETH&srcInAmount=${sendAmount}&dstChain=avalanche&dstTokenOut=aUSDC&slippage=1`;
const tradeSendTradeUrl: string = `http://localhost:3000/api/transaction?recipientAddress=0x5F88eC396607Fc3edb0424E8E6061949e6b624e7&srcChain=ethereum&srcTokenIn=WETH&srcInAmount=${sendAmount}&dstChain=avalanche&dstTokenOut=WAVAX&slippage=1`;
const sendTradeUrl: string = `http://localhost:3000/api/transaction?recipientAddress=0x5F88eC396607Fc3edb0424E8E6061949e6b624e7&srcChain=ethereum&srcTokenIn=aUSDC&srcInAmount=${aUSDC}&dstChain=avalanche&dstTokenOut=WAVAX&slippage=1`;

const squidContractAddress = process.env.squidContractAddress!
const privateKey = process.env.privateKey!
const ethRpcEndPoint = process.env.ethRpcEndPoint!

async function main(_url: string) {
    console.log("starting script");
    console.log('calling: ', _url)
    const response = await axios.get(_url);
    console.log('route type: ', response.data.routeType)

    const provider = new ethers.providers.JsonRpcProvider(
        ethRpcEndPoint
    );

    let wallet = new ethers.Wallet(
        privateKey,
        provider
    );

    //Construct transaction object with encoded data
    const tx: any = {
        to: squidContractAddress,
        data: response!.data.data,
        value: response!.data.gasReceiver ? BigInt(5e6) : null, //this will need to be calculated, maybe by the api
    };
    //sign and submit transaction
    let resp = await wallet.signTransaction(tx);
    const sentTxResponse = await wallet.sendTransaction(tx);
    const txReceipt = await sentTxResponse.wait(1);
    console.log(txReceipt);
}
main(sendTradeUrl) // pass in different urls with query strings for route types
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });