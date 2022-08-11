import { BigNumber, ethers } from 'ethers'

import * as dotenv from 'dotenv'

import SquidSdk from './src'
import { Environments, ChainName } from './src/types'

dotenv.config()

const sendAmount: BigNumber = ethers.utils.parseEther('1') // 0.1 WETH
// const aUSDC: BigNumber = ethers.utils.parseUnits('1', 6) // 1 aUSDC

const privateKey = process.env.privateKey as string
const ethRpcEndPoint = process.env.ethRpcEndPoint as string // be sure that rpc corresponds to env
const recipientAddress = process.env.recipientAddress as string
const provider = new ethers.providers.JsonRpcProvider(ethRpcEndPoint)

async function main() {
  const signer = new ethers.Wallet(privateKey, provider)
  const squidSdk = new SquidSdk({
    environment: Environments.LOCAL,
    shouldValidateApproval: true,
    shouldApprove: true
  })

  await squidSdk.init()

  console.log('> tokens: ', squidSdk.tokens)
  console.log('> chains: ', squidSdk.chains)

  // trade-send
  // const params = {
  //   recipientAddress,
  //   srcChain: ChainName.ETHEREUM,
  //   srcToken: 'WETH',
  //   amount: sendAmount.toString(),
  //   dstChain: ChainName.AVALANCHE,
  //   dstToken: 'axlUSDC',
  //   slippage: 1,
  //   env: Environments.LOCAL
  // }

  // trade-send-trade
  const params = {
    recipientAddress,
    srcChain: ChainName.ETHEREUM,
    srcToken: 'WETH',
    amount: sendAmount.toString(),
    dstChain: ChainName.AVALANCHE,
    dstToken: 'WAVAX',
    slippage: 1,
    env: Environments.LOCAL
  }

  // send-trade
  // const params = {
  //   recipientAddress,
  //   srcChain: ChainName.ETHEREUM,
  //   srcToken: 'aUSDC',
  //   amount: aUSDC,
  //   dstChain: ChainName.AVALANCHE,
  //   dstToken: 'axlUSDC',
  //   slippage: 1,
  //   env: Environments.LOCAL
  // }

  const getRouteData = await squidSdk.getRoute(params)

  console.log('> getRouteData: ', getRouteData)

  const executedRoute = await squidSdk.executeRoute({
    signer,
    transactionRequest: getRouteData.transactionRequest,
    params
  })

  console.log('> executedRoute: ', executedRoute)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('> error: ', error)
    console.log('> error message: ', error.message)
    console.log('> error response: ', error.response.data.error)
    process.exit(1)
  })
