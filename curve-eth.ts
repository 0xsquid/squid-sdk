import { ethers } from "ethers";
import { Squid } from "./src";

import erc20Abi from "./src/abi/erc20.json";
import abi from "./sushiswap.json";

import * as dotenv from "dotenv";

dotenv.config();

const getSDK = (): Squid => {
  const squid = new Squid({
    baseUrl: "http://localhost:3000"
  });
  return squid;
};

(async () => {
  try {
    /* const squid = getSDK();
    await squid.init(); */

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ethereumRpcEndPoint
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const contract = new ethers.Contract(
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      erc20Abi,
      signer
    );
    await contract.approve(
      "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );

    const _contractInterface = new ethers.utils.Interface(erc20Abi as any);

    const _data = _contractInterface.encodeFunctionData("approve", [
      "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    ]);

    console.log("> _data: ", _data);

    const contractInterface = new ethers.utils.Interface(abi as any);
    const data = contractInterface.encodeFunctionData(
      "swapExactTokensForTokens",
      [
        "100000000",
        "0",
        [
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
        ],
        signer.address,
        new Date().getTime() + 1e6
      ]
    );

    console.log("> data: ", data);

    const tx = {
      to: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
      data: data,
      gasLimit: 60e4 // 600000 gasLimit
    } as ethers.utils.Deferrable<ethers.providers.TransactionRequest>;

    const txs = await signer.sendTransaction(tx);
    const result = await txs.wait();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
})();
