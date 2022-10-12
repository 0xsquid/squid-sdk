import { describe, jest } from "@jest/globals";
import { ethers } from "ethers";
import { ChainName, Squid } from "../index";
import { getTokenBalance, waiting } from "./utils/utils";

//base config
jest.setTimeout(10000000);
const tokenAmount = ethers.utils.parseEther("0.1").toString(); // 0.1 WETH
const tokenAmountMoonbeam = ethers.utils.parseEther("1").toString(); // 0.1 WETH
const usdc = ethers.utils.parseUnits("10", 6).toString(); // 1 aUSDC
const privateKey =
  "0x6db76b64b8019ea6d646ee8b70a9e4f7c3aa0f943b42eb700d4a798b3544a094"; //needs to be diff for testnet
const squidSdk = new Squid({
  baseUrl: "http://localhost:3000" //| "http://testnet.api.0xsquid.com"
});
const axlUsdcSymbol = "axlUSDC";
const usdcSymbol = "USDC";
const timeToWait = 1000; //time taken between trades before querying the destination chain
const slippage = 99;

let ETHEREUM;
let AVALANCHE;
let MOONBEAM;

beforeAll(() => {
  return squidSdk.init();
});
beforeEach(() => {
  ETHEREUM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.ETHEREUM
  );
  AVALANCHE = squidSdk.chains.find(
    chain => chain.chainName == ChainName.AVALANCHE
  );
  MOONBEAM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.MOONBEAM
  );
});

describe("Testing trades from Ethereum to avalanche", () => {
  test(" test bridgeCall: usdc on ethereum to wavax on avalanche", async () => {
    ////////////////////
    //configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);
    console.log(`Using account: ${signer.address}`);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === usdcSymbol && t.chainId === ETHEREUM.chainId
      )!.address as string, //usdc
      fromAmount: usdc,
      toChain: AVALANCHE.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string, //wavax
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });
  /* 
  test(" test callBridge: WETH on ethereum to USDC on avalanche", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(
      squidSdk.chains.find(chain => chain.chainName == ChainName.ETHEREUM).rpc
    );
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    squidSdk.tokens;

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: AVALANCHE.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === AVALANCHE.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridge: Native ETH on ethereum to USDC on avalanche", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      fromAmount: tokenAmount,
      toChain: AVALANCHE.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === AVALANCHE.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: WETH on ethereum to WAVAX on avalanche", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: AVALANCHE.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: Native ETH on ethereum to Native AVAX on avalanche", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      fromAmount: tokenAmount,
      toChain: AVALANCHE.chainId,
      toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test sendOnly: USDC on ethereum to axlUSDC on avalanche", async () => {
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: ETHEREUM.squidContracts.defaultCrosschainToken,
      fromAmount: usdc,
      toChain: AVALANCHE.chainId,
      toToken: AVALANCHE.squidContracts.defaultCrosschainToken,
      slippage
    };

    // get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    // get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); // wait a few seconds

    // get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    // verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  }); */
});
/* 
describe("Testing trades from Ethereum to Moonbeam", () => {
  ETHEREUM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.ETHEREUM
  );
  AVALANCHE = squidSdk.chains.find(
    chain => chain.chainName == ChainName.AVALANCHE
  );
  MOONBEAM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.MOONBEAM
  );
  test(" test bridgeCall: usdc on ethereum to wglmr on moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === usdcSymbol && t.chainId === ETHEREUM.chainId
      )!.address as string, //usdc
      fromAmount: usdc,
      toChain: MOONBEAM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string, //wavax
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridge: WETH on ethereum to USDC on Moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: MOONBEAM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === MOONBEAM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: WETH on ethereum to WGLMR on Moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: MOONBEAM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: Native ETH on ethereum to Native GLMR on Moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      fromAmount: tokenAmount,
      toChain: MOONBEAM.chainId,
      toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test sendOnly: USDC on ethereum to axlUSDC on Moonbeam", async () => {
    const srcProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: ETHEREUM.chainId,
      fromToken: ETHEREUM.squidContracts.defaultCrosschainToken,
      fromAmount: usdc,
      toChain: MOONBEAM.chainId,
      toToken: MOONBEAM.squidContracts.defaultCrosschainToken,
      slippage
    };

    // get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    // get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); // wait a few seconds

    // get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    // verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });
});

describe("Testing trades from Avalanche to Ethereum", () => {
  ETHEREUM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.ETHEREUM
  );
  AVALANCHE = squidSdk.chains.find(
    chain => chain.chainName == ChainName.AVALANCHE
  );
  MOONBEAM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.MOONBEAM
  );
  test(" test bridgeCall: usdc on Avalanche to WETH on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo

    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === AVALANCHE.chainId
      )!.address as string, //usdc
      fromAmount: usdc,
      toChain: ETHEREUM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string, //wavax
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridge: WAVAX on Avalanche to USDC on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: ETHEREUM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === usdcSymbol && t.chainId === ETHEREUM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: WAVAX on Avalanche to WETH on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: ETHEREUM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: Native AVAX on Avalanche to Native ETH on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      fromAmount: tokenAmount,
      toChain: ETHEREUM.chainId,
      toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test sendOnly: axlUSDC on Avalanche to USDC on Ethereum", async () => {
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: AVALANCHE.squidContracts.defaultCrosschainToken,
      fromAmount: usdc,
      toChain: ETHEREUM.chainId,
      toToken: ETHEREUM.squidContracts.defaultCrosschainToken,
      slippage
    };

    // get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    // get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); // wait a few seconds

    // get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    // verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });
});

describe("Testing trades from Avalanche to Moonbeam", () => {
  ETHEREUM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.ETHEREUM
  );
  AVALANCHE = squidSdk.chains.find(
    chain => chain.chainName == ChainName.AVALANCHE
  );
  MOONBEAM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.MOONBEAM
  );
  test(" test bridgeCall: usdc on Avalanche to wglmr on moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === AVALANCHE.chainId
      )!.address as string, //usdc
      fromAmount: usdc,
      toChain: MOONBEAM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string, //wavax
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridge: WAVAX on Avalanche to USDC on Moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: MOONBEAM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === MOONBEAM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: WAVAX on Avalanche to WGLMR on Moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string,
      fromAmount: tokenAmount,
      toChain: MOONBEAM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: Nartive AVAX on Avalanche to Native GLMR on Moonbeam", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      fromAmount: tokenAmount,
      toChain: MOONBEAM.chainId,
      toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test sendOnly: axlUSDC on Avalanche to axlUSDC on Moonbeam", async () => {
    const srcProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: AVALANCHE.chainId,
      fromToken: AVALANCHE.squidContracts.defaultCrosschainToken,
      fromAmount: usdc,
      toChain: MOONBEAM.chainId,
      toToken: MOONBEAM.squidContracts.defaultCrosschainToken,
      slippage
    };

    // get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    // get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); // wait a few seconds

    // get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    // verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });
});

describe("Testing trades from Moonbeam to Avalanche", () => {
  ETHEREUM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.ETHEREUM
  );
  AVALANCHE = squidSdk.chains.find(
    chain => chain.chainName == ChainName.AVALANCHE
  );
  MOONBEAM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.MOONBEAM
  );
  test(" test bridgeCall: usdc on Moonbeam to wavax on ava", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);
    console.log(`Using account: ${signer.address}`);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === MOONBEAM.chainId
      )!.address as string, //usdc
      fromAmount: usdc,
      toChain: AVALANCHE.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string, //wavax
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridge: WGLMR on Moonbeam to USDC on avalanche", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string,
      fromAmount: tokenAmountMoonbeam,
      toChain: AVALANCHE.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === AVALANCHE.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: WGLMR on Moonbeam to WAVAX on avalanche", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string,
      fromAmount: tokenAmountMoonbeam,
      toChain: AVALANCHE.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WAVAX" && t.chainId === AVALANCHE.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: Native GLMR on Moonbeam to Native AVAX on avalanche", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      fromAmount: tokenAmountMoonbeam,
      toChain: AVALANCHE.chainId,
      toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test sendOnly: axlUSDC on Moonbeam to axlUSDC on Avalanche", async () => {
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(AVALANCHE.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: MOONBEAM.squidContracts.defaultCrosschainToken,
      fromAmount: usdc,
      toChain: AVALANCHE.chainId,
      toToken: AVALANCHE.squidContracts.defaultCrosschainToken,
      slippage
    };

    // get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    // get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); // wait a few seconds

    // get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    // verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });
});

describe("Testing trades from Moonbeam to Ethereum", () => {
  ETHEREUM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.ETHEREUM
  );
  AVALANCHE = squidSdk.chains.find(
    chain => chain.chainName == ChainName.AVALANCHE
  );
  MOONBEAM = squidSdk.chains.find(
    chain => chain.chainName == ChainName.MOONBEAM
  );
  test(" test bridgeCall: usdc on Moonbeam to WETH on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);
    console.log(`Using account: ${signer.address}`);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === axlUsdcSymbol && t.chainId === MOONBEAM.chainId
      )!.address as string, //usdc
      fromAmount: usdc,
      toChain: ETHEREUM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string, //wavax
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridge: WGLMR on Moonbeam to USDC on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string,
      fromAmount: tokenAmountMoonbeam,
      toChain: ETHEREUM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === usdcSymbol && t.chainId === ETHEREUM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: WGLMR on Moonbeam to WETH on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: squidSdk.tokens.find(
        t => t.symbol === "WGLMR" && t.chainId === MOONBEAM.chainId
      )!.address as string,
      fromAmount: tokenAmountMoonbeam,
      toChain: ETHEREUM.chainId,
      toToken: squidSdk.tokens.find(
        t => t.symbol === "WETH" && t.chainId === ETHEREUM.chainId
      )!.address as string,
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test callBridgeCall: Native GLMR on Moonbeam to Native ETH on Ethereum", async () => {
    ////////////////////
    /// configure this part
    //setting up providers and singer for chain combo
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      fromAmount: tokenAmountMoonbeam,
      toChain: ETHEREUM.chainId,
      toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      slippage
    };
    ////////////////////
    ////////////////////

    //get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    //get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );
    //

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); //wait a few seconds

    //get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    //verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });

  test(" test sendOnly: axlUSDC on Moonbeam to USDC on Ethereum", async () => {
    const srcProvider = new ethers.providers.JsonRpcProvider(MOONBEAM.rpc);
    const dstProvider = new ethers.providers.JsonRpcProvider(ETHEREUM.rpc);
    const signer = new ethers.Wallet(privateKey, srcProvider);

    const params = {
      toAddress: signer.address,
      fromChain: MOONBEAM.chainId,
      fromToken: MOONBEAM.squidContracts.defaultCrosschainToken,
      fromAmount: usdc,
      toChain: ETHEREUM.chainId,
      toToken: ETHEREUM.squidContracts.defaultCrosschainToken,
      slippage
    };

    // get before on src
    const srcTokenBalancePre: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    // get before on dst
    const dstTokenBalancePre: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    // execute route
    const { route } = await squidSdk.getRoute(params);
    const tx = await squidSdk.executeRoute({
      signer,
      route
    });
    const txReceipt = await tx.wait(1);

    await waiting(timeToWait); // wait a few seconds

    // get balance changes
    const srcTokenBalancePost: number = await getTokenBalance(
      params.fromToken,
      srcProvider,
      signer.address
    );
    const dstTokenBalancePost: number = await getTokenBalance(
      params.toToken,
      dstProvider,
      signer.address
    );

    expect(txReceipt.transactionHash).toContain("0x");
    // verify balance changes
    expect(srcTokenBalancePre).toBeGreaterThan(srcTokenBalancePost);
    expect(dstTokenBalancePre).toBeLessThan(dstTokenBalancePost);
  });
});
 */
