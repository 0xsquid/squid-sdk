import { EthersAdapter } from "../../adapter/EthersAdapter";

import {
  ExecuteRoute,
  RouteParamsPopulated,
  Contract,
  EvmWallet,
  TransactionRequest,
  TransactionResponse
} from "../../types";

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
      overrides
    } = data;
    const signer = data.signer as EvmWallet;

    const gasData = this.getGasData({
      transactionRequest: data.route.transactionRequest,
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

  async validateBalance({
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
    const wallet = data.signer as EvmWallet;

    let address = wallet.address;

    // ethers v5 & v6 support
    try {
      address = await wallet.getAddress();
    } catch (error) {
      // do nothing
    }

    // validate balance
    await this.validateBalance({
      sender: address,
      params
    });

    if (params.fromIsNative) {
      return true;
    }

    const hasAllowance = await this.validateAllowance({
      fromTokenContract: params.fromTokenContract as Contract,
      sender: address,
      router: data.route.transactionRequest.target,
      amount: BigInt(params.fromAmount)
    });

    // approve token spent if necessary
    if (!hasAllowance) {
      await this.approveRoute({ data, params });
    }

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
    const { fromIsNative, fromAmount } = params;
    const fromTokenContract = params.fromTokenContract as Contract;

    if (fromIsNative) {
      return true;
    }

    let amountToApprove = BigInt(uint256MaxValue);

    if (executionSettings?.infiniteApproval === false) {
      amountToApprove = BigInt(fromAmount);
    }

    const tx = await fromTokenContract.approve(
      target,
      amountToApprove,
      overrides || {}
    );

    await tx.wait();

    return true;
  }

  async isRouteApproved({
    sender,
    target,
    params
  }: {
    sender: string;
    target: string;
    params: RouteParamsPopulated;
  }) {
    const result = await this.validateBalance({ sender, params });

    if (params.fromIsNative) {
      return {
        isApproved: true,
        message: "Not required for native token"
      };
    }

    const hasAllowance = await this.validateAllowance({
      fromTokenContract: params.fromTokenContract as Contract,
      sender,
      router: target,
      amount: BigInt(params.fromAmount)
    });

    if (!hasAllowance) {
      return {
        isApproved: false,
        message: "Not enough allowance"
      };
    }

    return result;
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
      chainId: parseInt(route.params.fromChain as string, 10),
      to: target,
      data: data,
      value: value,
      nonce,
      ...gasData
    });
  }
}
