import { BigNumber, ethers } from 'ethers'

import * as dotenv from 'dotenv'

import SquidSdk from './src'
import { Environments } from './src/types'
import { ChainName } from './src/contants/chains'

dotenv.config()

const sendAmount: BigNumber = ethers.utils.parseEther('1') //0.1 WETH
// const aUSDC: BigNumber = ethers.utils.parseUnits('1', 6) // 1 aUSDC

const privateKey = process.env.privateKey as string
const ethRpcEndPoint = process.env.ethRpcEndPoint as string
const recipientAddress = process.env.recipientAddress as string
const provider = new ethers.providers.JsonRpcProvider(ethRpcEndPoint)

async function main() {
  const wallet = new ethers.Wallet(privateKey, provider)
  const squidSdk = new SquidSdk({ environment: Environments.LOCAL })

  // trade-send
  // const tx = await squidSdk.getTx({
  //   recipientAddress,
  //   srcChain: ChainName.ETHEREUM,
  //   srcTokenIn: 'WETH',
  //   srcInAmount: sendAmount,
  //   dstChain: ChainName.AVALANCHE,
  //   dstTokenOut: 'axlUSDC',
  //   slippage: 1,
  // })

  // trade-send-trade
  const tx = await squidSdk.getTx({
    recipientAddress,
    srcChain: ChainName.ETHEREUM,
    srcTokenIn: 'WETH',
    srcInAmount: sendAmount.toString(),
    dstChain: ChainName.AVALANCHE,
    dstTokenOut: 'WAVAX',
    slippage: 1,
  })

  // send-trade
  // const tx = await squidSdk.getTx({
  //   recipientAddress,
  //   srcChain: ChainName.ETHEREUM,
  //   srcTokenIn: 'aUSDC',
  //   srcInAmount: aUSDC,
  //   dstChain: ChainName.AVALANCHE,
  //   dstTokenOut: 'axlUSDC',
  //   slippage: 1,
  // })

  console.log('> tx: ', tx)

  const signTxResponse = await wallet.signTransaction(tx)
  console.log('> signTxResponse: ', signTxResponse)
  const sentTxResponse = await wallet.sendTransaction(tx)
  console.log('> sentTxResponse: ', sentTxResponse.hash)
  const txReceipt = await sentTxResponse.wait(1)
  console.log('> txReceipt: ', txReceipt.transactionHash)
}

async function getRoute() {
  const squidSdk = new SquidSdk({ environment: Environments.LOCAL })

  const data = await squidSdk.getRoute({
    srcChain: ChainName.ETHEREUM,
    srcToken: 'WETH',
    destChain: ChainName.AVALANCHE,
    destToken: 'WAVAX',
    amount: sendAmount.toString(),
  })

  console.log('> data: ', data)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('> error: ', error)
    console.log('> error message: ', error.message)
    console.log('> error response: ', error.response.data.error)
    process.exit(1)
  })
