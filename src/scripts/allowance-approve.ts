import { ethers } from "ethers";

import * as dotenv from "dotenv";

import { Squid } from "..";

dotenv.config();

const privateKey = process.env.privateKey as string;
const ethRpcEndPoint = process.env.ethRpcEndPoint as string;
const provider = new ethers.providers.JsonRpcProvider(ethRpcEndPoint);

async function main() {
  const signer = new ethers.Wallet(privateKey, provider);
  const squid = new Squid();

  await squid.init();

  const allowance = await squid.allowance({
    owner: signer.address,
    spender: "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: "1"
  });

  console.log("> allowance: ", allowance.toString());

  const approve = await squid.approve({
    signer,
    spender: "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: "1"
    // amount: "100"
  });

  console.log("> approve: ", approve);

  const allowance2 = await squid.allowance({
    owner: signer.address,
    spender: "0x6972A415e0572bd2E5E3c7DF307d0AFe32D30955",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: "1"
  });

  console.log("> allowance: ", allowance2.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("> error: ", error);
    console.log("> error message: ", error.message);
    console.log("> error response: ", error.response.data.error);
    process.exit(1);
  });
