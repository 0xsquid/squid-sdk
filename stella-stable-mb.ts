import { ethers } from "ethers";
import { Squid } from "./src";

import * as dotenv from "dotenv";

dotenv.config();

import erc20Abi from "./src/abi/erc20.json";
import stellaRouterAbi from "./stellaswapRouter.json";

const getSDK = (): Squid => {
  const squid = new Squid({
    baseUrl: "http://localhost:3000"
  });
  return squid;
};

(async () => {
  try {
    const squid = getSDK();
    await squid.init();

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.moonbeamRpcEndPoint
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const erc20token = new ethers.Contract(
      "0x931715FEE2d06333043d11F658C8CE934aC61D0c",
      erc20Abi,
      signer
    );
    await erc20token.approve(
      "0xB0Dfd6f3fdDb219E60fCDc1EA3D04B22f2FFa9Cc",
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );

    const router = new ethers.Contract(
      "0xB0Dfd6f3fdDb219E60fCDc1EA3D04B22f2FFa9Cc",
      stellaRouterAbi,
      signer
    );

    const result = await (
      await router.swapFromBase(
        "0xA1ffDc79f998E7fa91bA3A6F098b84c9275B0483",
        "0xb1bc9f56103175193519ae1540a0a4572b1566f6",
        0,
        0,
        50000000,
        0,
        new Date().getTime() + 1e6,
        {
          gasLimit: 10000000
        }
      )
    ).wait();

    /* const contractInterface = new ethers.utils.Interface(abi as any);
    const args = [
      "0xc2cf1d6fc6951b6d53c9f1fc612edd4d95c88e5c",
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
      "0xca01a1d0993565291051daff390892518acfad3a",
      100000000,
      0,
      signer.address
    ];

    const data = contractInterface.encodeFunctionData(
      "exchange(address,address,address,uint256,uint256,address)",
      args
    );
    console.log(data);
    const tx = {
      to: "0xc2cf1d6fc6951b6d53c9f1fc612edd4d95c88e5c",
      data: data,
      gasLimit: 60e4 // 600000 gasLimit
    } as ethers.utils.Deferrable<ethers.providers.TransactionRequest>;

    const txs = await signer.sendTransaction(tx);
    const result = await txs.wait(); */

    console.log(result);
  } catch (error) {
    console.error(error);
  }
})();
