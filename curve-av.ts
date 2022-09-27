import { ethers, utils } from "ethers";

import uniswapV2Router02Abi from "./uniswapV2Like.json";
import erc20Abi from "./src/abi/erc20.json";
import curveAbi from "./curveRegistry.json";
import routerAbi from "./SquidRouter.json";

import * as dotenv from "dotenv";

dotenv.config();

const USDCE = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

const AXLUSDC = "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC";

const amountIn = "100000000000000000000";
const deadline = new Date().getTime() + 1e7;

const pangolin = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
const curve = "0xFE90eb3FbCddacD248fAFEFb9eAa24F5eF095778";

const tokenInterface = new ethers.utils.Interface(erc20Abi as any);
const uniInterface = new utils.Interface(uniswapV2Router02Abi);
const curveInterface = new ethers.utils.Interface(curveAbi as any);

const squidRouter = "0x116fB500fCb3D8E666Ba861a357be599A64cB92d";
const squidMulticall = "0x14Aa0C6fEa6F4B0586AEF117D7202a40f302327d";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.avalanceRpcEndPoint
);
const signer = new ethers.Wallet(process.env.privateKey as string, provider);

const squidRouterContract = new ethers.Contract(
  squidRouter,
  routerAbi as any,
  signer
);

(async () => {
  try {
    const contract = new ethers.Contract(WAVAX, erc20Abi, signer);
    await contract.approve(
      squidRouter,
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );

    const calls = [
      {
        callType: 0,
        target: WAVAX,
        value: 0,
        callData: tokenInterface.encodeFunctionData("approve", [
          pangolin,
          amountIn
        ]),
        payload: "0x"
      },
      {
        callType: 0,
        target: pangolin,
        value: 0,
        callData: uniInterface.encodeFunctionData("swapExactTokensForTokens", [
          amountIn,
          0,
          [WAVAX, USDCE],
          squidRouter,
          deadline
        ]),
        payload: "0x"
      }
      /* {
        callType: 1,
        target: AXLUSDC,
        value: 0,
        callData: tokenInterface.encodeFunctionData("approve", [curve, 0]),
        payload: utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [AXLUSDC, 1]
        )
      },
      {
        callType: 1,
        target: curve,
        value: 0,
        callData: curveInterface.encodeFunctionData(
          "exchange(address,address,address,uint256,uint256,address)",
          [
            "0xbb8a6436e0e9a22bb7f1dc76afb4421d8195620e",
            USDCE,
            AXLUSDC,
            0,
            0,
            signer.address
          ]
        ),
        payload: utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [AXLUSDC, 2]
        )
      } */
    ];

    const tx = await squidRouterContract
      .connect(signer)
      .callBridge(WAVAX, amountIn, "1", signer.address, "axlUSDC", calls);

    console.log("> tx: ", tx);
    console.log("> result: ", await tx.wait());
  } catch (error) {
    console.error(error);
  }
})();
