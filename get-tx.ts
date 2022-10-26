import { ethers } from "ethers";

import * as dotenv from "dotenv";

import abi from "./src/abi/erc20.json";

dotenv.config();

(async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ethereumRpcEndPoint // "https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9"
    );

    const contract = new ethers.Contract(
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      abi,
      provider
    );

    const filter = contract.filters.Transfer(
      null,
      "0x329a8b957388d66632c1421a4bcae304cd10682e" // "0xF72d63C3A6cA33bCbaEFf037F068f1dE466CCA89"
    );
    console.log("> filter: ", filter);

    const logs = await contract.queryFilter(filter, -100, "latest");
    console.log(
      "> logs: ",
      logs,
      logs[logs.length - 1]?.args?.value.toString()
    );
    /* const tx = await provider.getTransaction(
      "0x8937c055cc446837abfa15d00a0e45ee7e0e3e49ea9567dafba938b8b7bb1ea3"
    ); 
    console.log("> tx: ", tx);
    */
  } catch (error: any) {
    console.error(error);
  }
})();
