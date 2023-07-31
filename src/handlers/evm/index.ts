import { EthersAdapter } from "../../adapter/EthersAdapter";

import { ExecuteRoute, RouteParamsPopulated } from "../../types";
import {
  Contract,
  EvmSigner,
  Signer,
  TransactionRequest,
  TransactionResponse,
  UnsignedTransaction,
  Wallet
} from "../../types/ethers";

import { uint256MaxValue } from "../../constants";
import { Utils } from "./utils";

const ethersAdapter = new EthersAdapter();

export class EvmHandler extends Utils {
  async executeRoute({
    data,
    params
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<TransactionResponse> {
    const {
      route: {
        transactionRequest: { target, value, data: _data }
      },
      route,
      overrides
    } = data;
    const signer = data.signer as EvmSigner;

    const gasData = this.getGasData({
      transactionRequest: route.transactionRequest,
      overrides
    });

    await this.validateBalanceAndApproval({
      data: {
        ...data,
        overrides: gasData
      },
      params
    });

    const tx = {
      to: target,
      data: _data,
      value,
      ...gasData
    } as TransactionRequest;

    return await signer.sendTransaction(tx);
  }

  async isRouteApproved({
    sender,
    params
  }: {
    sender: string;
    params: RouteParamsPopulated;
  }): Promise<{
    isApproved: boolean;
    message: string;
  }> {
    const {
      fromAmount,
      fromIsNative,
      fromProvider,
      fromChain,
      fromTokenContract
    } = params;

    const amount = BigInt(fromAmount);

    if (fromIsNative) {
      return await this.validateNativeBalance({
        fromProvider,
        sender,
        amount,
        fromChain
      });
    } else {
      return await this.validateTokenBalance({
        amount,
        fromTokenContract: fromTokenContract as Contract,
        fromChain,
        sender
      });
    }
  }

  async validateBalanceAndApproval({
    data,
    params
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<boolean> {
    const signer = data.signer as EvmSigner;

    let address: string;

    // get address from differents ethers instances
    if (signer && ethersAdapter.isSigner(signer)) {
      address = await (signer as Signer).getAddress();
    } else {
      address = (signer as Wallet).address;
    }

    // validate balance
    await this.isRouteApproved({ sender: address, params });

    // approve token spent if necessary
    await this.approveRoute({ data, params });

    return true;
  }

  async approveRoute({
    data,
    params
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }): Promise<boolean> {
    const {
      route: {
        transactionRequest: { target }
      },
      executionSettings,
      overrides
    } = data;
    const signer = data.signer as EvmSigner;
    const { fromIsNative, fromAmount, fromTokenContract } = params;

    if (fromIsNative) {
      return true;
    }

    let amountToApprove = BigInt(uint256MaxValue);

    if (executionSettings?.infiniteApproval === false) {
      amountToApprove = BigInt(fromAmount);
    }

    const approveTx = await (fromTokenContract as Contract)
      .connect(signer)
      .approve(target, amountToApprove, overrides);
    await approveTx.wait();

    return true;
  }

  getRawTxHex({
    nonce,
    route,
    overrides
  }: Omit<ExecuteRoute, "signer"> & { nonce: number }): string {
    const { target, data, value } = route.transactionRequest;

    const gasData = this.getGasData({
      transactionRequest: route.transactionRequest,
      overrides
    });

    return ethersAdapter.serializeTransaction({
      chainId: parseInt(route.params.fromChain as string),
      to: target,
      data: data,
      value: value,
      nonce,
      ...gasData
    } as UnsignedTransaction);
  }
}
