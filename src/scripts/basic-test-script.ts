import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Squid } from "../../src";
import { getTestCases } from "./basic-test-config";

dotenv.config();
const privateKey = process.env.privateKey as string;
const rpcEndPoint = process.env.ethereumRpcEndPoint as string; // be sure that rpc corresponds to env
const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint);

async function main() {
  const signer = new ethers.Wallet(privateKey, provider);
  const squidSdk = new Squid({
    baseUrl: "update this" // "http://localhost:3000" | "http://testnet.api.0xsquid.com"
  });

  await squidSdk.init();
  const testCases = await getTestCases(squidSdk, signer.address); //configure test in test cases
  for (let i = 0; i < testCases.length; i++) {
    console.log(`\n >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
    const config = testCases[i];
    console.log(`> test case index: ${i}`);
    console.log("> params: ", config);

    const { route } = await squidSdk.getRoute(config.params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);
    console.log("> txReceipt: ", txReceipt.transactionHash);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("> error: ", error);
    console.log("> error message: ", error.message);
    console.log("> error response: ", error.response.data.error);
    process.exit(1);
  });
