import { ethers } from "ethers";
import { Squid } from "./src";

import erc20Abi from "./src/abi/erc20.json";
import abi from "./curveRegistry.json";

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

    const contract = new ethers.Contract(
      "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9",
      erc20Abi,
      signer
    );
    await contract.approve(
      "0xc2cf1d6fc6951b6d53c9f1fc612edd4d95c88e5c",
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );
    console.log(
      "balance: ",
      await contract.balanceOf("0xc2cf1d6fc6951b6d53c9f1fc612edd4d95c88e5c")
    );

    const contract2 = new ethers.Contract(
      "0xc2cf1d6fc6951b6d53c9f1fc612edd4d95c88e5c",
      abi as any,
      signer
    );
    const result = await (
      await contract2[
        "exchange(address,address,address,uint256,uint256,address)"
      ](
        "0xc2cf1d6fc6951b6d53c9f1fc612edd4d95c88e5c",
        "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9",
        "0xca01a1d0993565291051daff390892518acfad3a",
        100000000,
        0,
        signer.address
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
