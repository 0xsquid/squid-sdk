import { ethers, UnsignedTransaction } from "ethers";
import { ExecuteRoute, RouteParamsPopulated } from "../../types";
import { uint256MaxValue } from "../../constants";
import { Utils } from "./utils";

export class EvmHandler extends Utils {
  async executeRoute({
    data,
    params
  }: {
    data: ExecuteRoute;
    params: RouteParamsPopulated;
  }) {
    const {
      route: {
        transactionRequest: { target, value, data: _data }
      },
      route,
      signer,
      overrides
    } = data;

    const gasData = this.getGasData({
      transactionRequest: route.transactionRequest,
      overrides
    });

    await this.validateBalanceAndApproval({
      data,
      params
    });

    const tx = {
      to: target,
      data: _data,
      value,
      ...gasData
    } as ethers.utils.Deferrable<ethers.providers.TransactionRequest>;

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
        fromTokenContract: fromTokenContract as ethers.Contract,
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
  }) {
    const {
      route: {
        transactionRequest: { target }
      },
      signer,
      overrides,
      executionSettings: { infiniteApproval }
    } = data;

    const { fromAmount, fromIsNative, fromTokenContract } = params;

    const sourceAmount = BigInt(fromAmount);
    let address: string;

    // get address from differents ethers instances
    if (signer && ethers.Signer.isSigner(signer)) {
      address = await (signer as ethers.Signer).getAddress();
    } else {
      address = (signer as ethers.Wallet).address;
    }

    // validate balance
    await this.isRouteApproved({ sender: address, params });

    // approve token spent if necessary
    if (!fromIsNative) {
      const allowance = BigInt(
        (await fromTokenContract.allowance(address, target)).toString()
      );

      if (sourceAmount > allowance) {
        let amountToApprove = BigInt(uint256MaxValue);

        if (infiniteApproval === false) {
          amountToApprove = sourceAmount;
        }

        const approveTx = await fromTokenContract
          .connect(signer)
          .approve(target, amountToApprove, overrides);
        await approveTx.wait();
      }
    }
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
      signer,
      overrides
    } = data;
    const { fromIsNative, fromAmount, fromTokenContract } = params;

    if (fromIsNative) {
      return true;
    }

    let amountToApprove = BigInt(uint256MaxValue);

    if (executionSettings?.infiniteApproval === false) {
      amountToApprove = BigInt(fromAmount);
    }

    const approveTx = await (fromTokenContract as ethers.Contract)
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

    return ethers.utils.serializeTransaction({
      chainId: parseInt(route.params.fromChain as string),
      to: target,
      data: data,
      value: value,
      nonce,
      ...gasData
    } as UnsignedTransaction);
  }
}
