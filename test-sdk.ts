import { BigNumber, ethers } from 'ethers'

import * as dotenv from 'dotenv'

import SquidSdk from './src'
import { Environments } from './src/types'

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

  // console.log('> tokens: ', squidSdk.tokens)
  // console.log('> chains: ', squidSdk.chains)

  // trade-send
  // const params = {
  //   recipientAddress,
  //   sourceChainId: 1, // ChainName.ETHEREUM,
  //   sourceTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'WETH')?.address as string,
  //   sourceAmount: sendAmount.toString(),
  //   destinationChainId: 43114, // ChainName.AVALANCHE,
  //   destinationTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'axlUSDC')?.address as string,
  //   slippage: 1,
  //   env: Environments.LOCAL
  // }

  // trade-send-trade
  const params = {
    recipientAddress,
    sourceChainId: 1, // ChainName.ETHEREUM,
    sourceTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'WETH')
      ?.address as string,
    sourceAmount: sendAmount.toString(),
    destinationChainId: 43114, // ChainName.AVALANCHE,
    destinationTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'WAVAX')
      ?.address as string,
    slippage: 1,
    env: Environments.LOCAL
  }

  // send-trade
  // const params = {
  //   recipientAddress,
  //   sourceChainId: 1, // ChainName.ETHEREUM,
  //   sourceTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'aUSDC')?.address as string,
  //   sourceAmount: aUSDC,
  //   destinationChainId: 43114, // ChainName.AVALANCHE,
  //   destinationTokenAddress: squidSdk.tokens?.find(t => t.symbol === 'axlUSDC')?.address as string,
  //   slippage: 1,
  //   env: Environments.LOCAL
  // }

  const { route } = await squidSdk.getRoute(params)

  console.log('> route: ', route)

  const executedRoute = await squidSdk.executeRoute({
    signer,
    route
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
