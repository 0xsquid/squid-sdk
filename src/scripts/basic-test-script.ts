import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { GetRoute, Squid } from "../../src";

dotenv.config();
const privateKey = process.env.testerPk as string;

async function main() {
  const squidSdk = new Squid({
    baseUrl: "http://localhost:3000" // "http://localhost:3000" | "http://testnet.api.0xsquid.com"
  });

  await squidSdk.init();
  const ethereum = squidSdk.chains.find(c => c.chainId === "5");
  const polygon = squidSdk.chains.find(c => c.chainId === "80001");
  const fromToken = squidSdk.tokens.find(
    t => t.symbol === "aUSDC" && t.chainId === "5"
  )?.address as string;
  const toToken = squidSdk.tokens.find(
    t => t.symbol === "aUSDC" && t.chainId === "80001"
  )?.address as string;
  const provider = new ethers.providers.JsonRpcProvider(ethereum?.rpc);
  const signer = new ethers.Wallet(privateKey, provider);
  console.log("signer: ", signer.address);
  const params = {
    toAddress: signer.address,
    fromChain: ethereum?.chainId,
    fromToken,
    fromAmount: ethers.utils.parseUnits("0.1", 6).toString(),
    toChain: polygon?.chainId,
    toToken,
    slippage: 1
  };

  const routeResponse = await squidSdk.getRoute(params as GetRoute);
  console.log("routeResponse: ", routeResponse.route.estimate.feeCosts);
  // const Tx = await squidSdk.executeRoute({
  //   signer,
  //   route: routeResponse.route
  // });
  // console.log("Tx: ", Tx);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("> error: ", error);
    console.log("> error message: ", error.message);
    console.log("> error response: ", error.response.data.error);
    process.exit(1);
  });
