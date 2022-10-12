import { ethers, Contract, BigNumber } from "ethers";
import abi from "./erc20.json";

export async function getTokenBalance(
  tokenAddress: string,
  provider: ethers.providers.JsonRpcProvider,
  address: string
) {
  let balance: BigNumber;
  //const erc20Abi = require("./../abi/erc20.json");
  const tokenContract = new ethers.Contract(tokenAddress, abi, provider);
  if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    balance = await provider.getBalance(address);
  } else {
    balance = await tokenContract.balanceOf(address);
  }
  return parseInt(balance.toString());
}

export async function waiting(waitTime: number) {
  await new Promise(resolve => setTimeout(resolve, waitTime));
}
