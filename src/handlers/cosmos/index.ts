export * from "./cctpProto";

import { fromBech32, toBech32, toUtf8 } from "@cosmjs/encoding";
import { calculateFee, Coin, GasPrice, StargateClient } from "@cosmjs/stargate";

import {
  CosmosSigner,
  ExecuteRoute,
  RouteParamsPopulated,
  CosmosMsg,
  CosmosBalance,
  CosmosChain,
  CosmosAddress,
  ChainType,
  CCTP_TYPE,
  RouteRequest,
  IBC_TRANSFER_TYPE,
  WASM_TYPE,
} from "../../types";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { MsgDepositForBurn } from "./cctpProto";
import { TokensChains } from "../../utils/TokensChains";

export class CosmosHandler {
  public static normalizeIbcAddress = (address: string): string => {
    if (!address.startsWith("ibc")) {
      return address;
    }

    const [prefix, denom] = address.split("/");
    return `${prefix}/${denom.toUpperCase()}`;
  };

  async validateBalance({
    data,
    params,
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<boolean> {
    const { signerAddress } = data;
    const signer = data.signer as CosmosSigner;
    const coin = {
      denom: CosmosHandler.normalizeIbcAddress(params.fromToken.address),
      amount: params.fromAmount,
    } as Coin;

    if (!signerAddress) {
      throw new Error("signerAddress not provided");
    }

    const signerCoinBalance = await signer.getBalance(signerAddress, coin.denom);

    const currentBalance = BigInt(signerCoinBalance.amount);
    const transferAmount = BigInt(coin.amount);

    if (transferAmount > currentBalance) {
      throw `Insufficient funds for account: ${signerAddress} on chain ${params.fromChain.chainId}`;
    }

    return true;
  }

  async executeRoute({
    data,
    params,
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<TxRaw> {
    await this.validateBalance({ data, params });

    const { route } = data;
    const signerAddress = data.signerAddress as string;
    const signer = data.signer as CosmosSigner;

    const msgs = [];

    const cosmosMsg: CosmosMsg = JSON.parse(route.transactionRequest?.data as string);

    switch (cosmosMsg.typeUrl) {
      case CCTP_TYPE: {
        signer.registry.register(CCTP_TYPE, MsgDepositForBurn);

        cosmosMsg.value.mintRecipient = new Uint8Array(
          Buffer.from(cosmosMsg.value.mintRecipient, "base64"),
        );
        msgs.push(cosmosMsg);

        break;
      }

      case IBC_TRANSFER_TYPE:
        msgs.push(cosmosMsg);

        break;

      case WASM_TYPE:
        // register execute wasm msg type for signer
        signer.registry.register(WASM_TYPE, MsgExecuteContract);

        cosmosMsg.value.msg = toUtf8(cosmosMsg.value.msg);
        msgs.push(cosmosMsg);

        break;

      default:
        throw new Error(`Cosmos message ${cosmosMsg.typeUrl} not supported`);
    }

    // simulate tx to estimate gas cost
    const estimatedGas = await signer.simulate(signerAddress, msgs, "");
    const gasMultiplier = Number(route.transactionRequest?.maxFeePerGas) || 1.3;
    const gasPrice = route.transactionRequest?.gasPrice as string;

    let memo = "";
    if (data.route.transactionRequest?.requestId) {
      memo = JSON.stringify({
        squidRequestId: data.route.transactionRequest?.requestId,
      });
    }

    return signer.sign(
      signerAddress,
      msgs,
      calculateFee(Math.trunc(estimatedGas * gasMultiplier), GasPrice.fromString(gasPrice)),
      memo,
    );
  }

  async getBalances({
    addresses,
    cosmosChains,
  }: {
    addresses: CosmosAddress[];
    cosmosChains: CosmosChain[];
  }): Promise<CosmosBalance[]> {
    const cosmosBalances: CosmosBalance[] = [];

    for (const chain of cosmosChains) {
      if (chain.chainType !== ChainType.COSMOS) continue;

      const addressData = addresses.find(address => address.coinType === chain.coinType);

      if (!addressData) continue;

      const cosmosAddress = this.deriveCosmosAddress(
        chain.bech32Config.bech32PrefixAccAddr,
        addressData.address,
      );

      try {
        const client = await StargateClient.connect(chain.rpc);

        const balances = (await client.getAllBalances(cosmosAddress)) ?? [];

        if (balances.length === 0) continue;

        balances.forEach(balance => {
          const { amount, denom } = balance;

          cosmosBalances.push({
            balance: amount,
            denom,
            chainId: String(chain.chainId),
            decimals:
              chain.currencies.find(currency => currency.coinDenom === denom)?.coinDecimals ?? 6,
          });
        });
      } catch (error) {
        //
      }
    }

    return cosmosBalances;
  }

  deriveCosmosAddress(chainPrefix: string, address: string): string {
    return toBech32(chainPrefix, fromBech32(address).data);
  }

  populateRouteParams(tokensChains: TokensChains, params: RouteRequest): RouteParamsPopulated {
    const { fromChain, toChain, fromToken, toToken } = params;

    const _fromChain = tokensChains.getChainData(fromChain);
    const _toChain = tokensChains.getChainData(toChain);
    const _fromToken = tokensChains.getTokenData(fromToken, fromChain);
    const _toToken = tokensChains.getTokenData(toToken, toChain);

    return {
      ...params,
      fromChain: _fromChain,
      toChain: _toChain,
      fromToken: _fromToken,
      toToken: _toToken,
    } as RouteParamsPopulated;
  }
}
