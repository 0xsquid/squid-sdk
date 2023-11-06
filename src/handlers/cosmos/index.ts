import { fromBech32, toBech32, toUtf8 } from "@cosmjs/encoding";
import { calculateFee, Coin, GasPrice, StargateClient } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";

import {
  CosmosSigner,
  ExecuteRoute,
  RouteParamsPopulated,
  CosmosMsg,
  IBC_TRANSFER_TYPE,
  WasmHookMsg,
  WASM_TYPE,
  CosmosBalance,
  CosmosChain,
  CosmosAddress,
  ChainType
} from "../../types";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export class CosmosHandler {
  async validateBalance({
    data,
    params
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<boolean> {
    const { signerAddress } = data;
    const signer = data.signer as CosmosSigner;
    const coin = {
      denom: params.fromToken.address,
      amount: params.fromAmount
    } as Coin;

    if (!signerAddress) {
      throw new Error("signerAddress not provided");
    }

    const signerCoinBalance = await signer.getBalance(
      signerAddress,
      coin.denom
    );

    const currentBalance = BigInt(signerCoinBalance.amount);
    const transferAmount = BigInt(coin.amount);

    if (transferAmount > currentBalance) {
      throw `Insufficient funds for account: ${signerAddress} on chain ${params.fromChain.chainId}`;
    }

    return true;
  }

  async executeRoute({
    data,
    params
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<TxRaw> {
    await this.validateBalance({ data, params });

    const { route } = data;
    const signerAddress = data.signerAddress as string;
    const signer = data.signer as CosmosSigner;

    const cosmosMsg: CosmosMsg = JSON.parse(
      route.transactionRequest?.data as string
    );
    const msgs = [];

    switch (cosmosMsg.msgTypeUrl) {
      case IBC_TRANSFER_TYPE: {
        msgs.push({
          typeUrl: cosmosMsg.msgTypeUrl,
          value: cosmosMsg.msg
        });

        break;
      }

      case WASM_TYPE: {
        // register execute wasm msg type for signer
        signer.registry.register(WASM_TYPE, MsgExecuteContract);

        const wasmHook = cosmosMsg.msg as WasmHookMsg;
        msgs.push({
          typeUrl: cosmosMsg.msgTypeUrl,
          value: {
            sender: signerAddress,
            contract: wasmHook.wasm.contract,
            msg: toUtf8(JSON.stringify(wasmHook.wasm.msg)),
            funds: [
              {
                denom: params.fromToken.address,
                amount: route.params.fromAmount
              }
            ]
          }
        });

        break;
      }

      default:
        throw new Error(`Cosmos message ${cosmosMsg.msgTypeUrl} not supported`);
    }

    // simulate tx to estimate gas cost
    const estimatedGas = await signer.simulate(signerAddress, msgs, "");
    const gasMultiplier = Number(route.transactionRequest?.maxFeePerGas) || 1.3;
    const gasPrice = route.transactionRequest?.gasPrice as string;

    return signer.sign(
      signerAddress,
      msgs,
      calculateFee(
        Math.trunc(estimatedGas * gasMultiplier),
        GasPrice.fromString(gasPrice)
      ),
      ""
    );
  }

  async getBalances({
    addresses,
    cosmosChains
  }: {
    addresses: CosmosAddress[];
    cosmosChains: CosmosChain[];
  }): Promise<CosmosBalance[]> {
    const cosmosBalances: CosmosBalance[] = [];

    for (const chain of cosmosChains) {
      if (chain.chainType !== ChainType.COSMOS) continue;

      const addressData = addresses.find(
        address => address.coinType === chain.coinType
      );

      if (!addressData) continue;

      const cosmosAddress = this.deriveCosmosAddress(
        chain.bech32Config.bech32PrefixAccAddr,
        addressData.address
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
              chain.currencies.find(currency => currency.coinDenom === denom)
                ?.coinDecimals ?? 6
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
}
