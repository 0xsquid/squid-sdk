import { ethers } from "ethers";
import { Squid } from "./src";

import erc20Abi from "./src/abi/erc20.json";
import routerAbi from "./uniswapV2Like.json";
import saddleAbi from "./saddle.json";

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
    const squid = getSDK();
    await squid.init();

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.moonbeamRpcEndPoint
    );
    const signer = new ethers.Wallet(
      process.env.privateKey as string,
      provider
    );

    const WGLMR = "0xAcc15dC74880C9944775448304B263D191c6077F";
    const USDC = "0x931715FEE2d06333043d11F658C8CE934aC61D0c";
    const USDT = "0x692c57641fc054c2ad6551ccc6566eba599de1ba";

    const STELLASWAP_ROUTER = "0x70085a09D30D6f8C4ecF6eE10120d1847383BB57";
    const STELLASWAP_SADDLE = "0xb1bc9f56103175193519ae1540a0a4572b1566f6";

    const WGLMR_CONTRACT = new ethers.Contract(WGLMR, erc20Abi, signer);
    await WGLMR_CONTRACT.approve(
      STELLASWAP_ROUTER,
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );
    const USDT_CONTRACT = new ethers.Contract(USDC, erc20Abi, signer);
    await USDT_CONTRACT.approve(
      STELLASWAP_SADDLE,
      "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      {
        gasLimit: 1000000
      }
    );

    /* const ROUTER = new ethers.Contract(
      STELLASWAP_ROUTER,
      routerAbi as any,
      signer
    );
    const FIRST_SWAP = await (
      await ROUTER.swapExactTokensForTokens(
        "100000000000000000000",
        "0",
        [WGLMR, USDC],
        signer.address,
        new Date().getTime() + 1e6
      )
    ).wait();

    console.log("> FIRST_SWAP: ", FIRST_SWAP); */

    const SADDLE = new ethers.Contract(
      STELLASWAP_SADDLE,
      saddleAbi as any,
      signer
    );

    const QUOTE = await SADDLE.calculateSwap(0, 1, "30000000");

    console.log("> QUOTE: ", QUOTE.toString());

    const SECOND_SWAP = await (
      await SADDLE.swap(0, 2, 30000000, 0, new Date().getTime() + 1e6, {
        gasLimit: 1000000
      })
    ).wait();

    console.log("> SECOND_SWAP: ", SECOND_SWAP);
  } catch (error) {
    console.error(error);
  }
})();
