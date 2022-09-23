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
      process.env.ethereumRpcEndPoint
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const contract = new ethers.Contract(
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      erc20Abi,
      signer
    );
    await contract.approve(
      "0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7",
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );

    /* const contract2 = new ethers.Contract(
      "0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7",
      abi as any,
      signer
    );
    console.log(contract2);
    const tx = await contract2[
      "exchange(address,address,address,uint256,uint256,address)"
    ](
      "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
      1000000000,
      0,
      signer.address
    );

    const result = await tx.wait(); */

    const contractInterface = new ethers.utils.Interface(abi as any);
    const args = [
      "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7",
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
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
      to: "0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7",
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
