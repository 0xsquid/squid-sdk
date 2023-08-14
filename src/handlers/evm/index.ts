import { EthersAdapter } from "../../adapter/EthersAdapter";

import { ExecuteRoute, RouteParamsPopulated } from "../../types";
import {
  Contract,
  EvmWallet,
  TransactionRequest,
  TransactionResponse
} from "../../types/ethers";

import { uint256MaxValue } from "../../constants";
import { Utils } from "./utils";

import erc20Abi from "../../abi/erc20.json";

const ethersAdapter = new EthersAdapter();
const erc20Interface = ethersAdapter.interface(erc20Abi);

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

    const address = wallet.address;

    // validate balance
    await this.validateBalance({
      sender: address,
      params
    });

    if (params.fromIsNative) {
      return true;
    }

    const hasAllowance = this.validateAllowance({
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
    const signer = data.signer as EvmWallet;
    const { fromIsNative, fromAmount, fromTokenContract } = params;

    if (fromIsNative) {
      return true;
    }

    let amountToApprove = BigInt(uint256MaxValue);

    if (executionSettings?.infiniteApproval === false) {
      amountToApprove = BigInt(fromAmount);
    }

    const connectedContract = await (fromTokenContract as Contract).connect(
      signer
    );

    if (connectedContract?.runner?.sendTransaction) {
      const approveTx = await connectedContract?.runner?.sendTransaction({
        to: fromTokenContract?.getAddress(),
        data: erc20Interface.encodeFunctionData("approve", [
          target,
          amountToApprove
        ]),
        ...overrides
      });

      await approveTx.wait();
    } else {
      throw new Error("No contract runner with signer provided");
    }

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
