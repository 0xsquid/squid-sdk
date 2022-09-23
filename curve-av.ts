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
      process.env.avalanceRpcEndPoint
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const contract = new ethers.Contract(
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
      erc20Abi,
      signer
    );
    await contract.approve(
      "0xFE90eb3FbCddacD248fAFEFb9eAa24F5eF095778",
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );
    console.log(
      "balance: ",
      await contract.balanceOf("0xbb8a6436e0e9a22bb7f1dc76afb4421d8195620e")
    );

    /* const contract2 = new ethers.Contract(
      "0xFE90eb3FbCddacD248fAFEFb9eAa24F5eF095778",
      abi as any,
      signer
    );
    const result = await (
      await contract2[
        "exchange(address,address,address,uint256,uint256,address)"
      ](
        "0xbb8a6436e0e9a22bb7f1dc76afb4421d8195620e",
        "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
        "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
        100000000,
        0,
        signer.address
      )
    ).wait(); */

    0:
    '0xbb8a6436e0e9a22bb7f1dc76afb4421d8195620e'
    1:
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664'
    2:
    '0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC'
    const contractInterface = new ethers.utils.Interface(abi as any);
    const args = [
      "0xbb8a6436e0e9a22bb7f1dc76afb4421d8195620e",
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
      "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
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
      to: "0xFE90eb3FbCddacD248fAFEFb9eAa24F5eF095778",
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
