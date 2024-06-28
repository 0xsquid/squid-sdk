import { ChainData, SquidData, Token } from "@0xsquid/squid-types";

import { OverrideParams, Contract, GasData, RpcProvider, TokenBalance } from "../../types";
import { MulticallWrapper } from "ethers-multicall-provider";
import { Provider, ethers } from "ethers";
import { multicallAbi, MULTICALL_ADDRESS, NATIVE_EVM_TOKEN_ADDRESS } from "../../constants";

export class Utils {
  async validateNativeBalance({
    fromProvider,
    sender,
    amount,
    fromChain,
  }: {
    fromProvider: RpcProvider;
    sender: string;
    amount: bigint;
    fromChain: ChainData;
  }) {
    const balance = await fromProvider.getBalance(sender);

    if (amount > balance) {
      throw new Error(`Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`);
    }

    return {
      isApproved: true,
      message: `User has the expected balance ${amount} of ${fromChain.nativeCurrency.symbol}`,
    };
  }

  async validateTokenBalance({
    amount,
    fromTokenContract,
    sender,
    fromChain,
  }: {
    amount: bigint;
    fromTokenContract: Contract;
    sender: string;
    fromChain: ChainData;
  }) {
    const balance = await (fromTokenContract as Contract).balanceOf(sender);

    if (amount > balance) {
      throw new Error(`Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`);
    }

    return {
      isApproved: true,
      message: `User has the expected balance ${amount} of ${await (
        fromTokenContract as Contract
      ).symbol()}`,
    };
  }

  async validateAllowance({
    amount,
    fromTokenContract,
    sender,
    router,
  }: {
    amount: bigint;
    fromTokenContract: Contract;
    sender: string;
    router: string;
  }) {
    const allowance = await (fromTokenContract as Contract).allowance(sender, router);

    return !(amount > allowance);
  }

  getGasData = ({
    transactionRequest,
    overrides,
  }: {
    transactionRequest: SquidData & { setGasPrice?: boolean };
    overrides?: OverrideParams;
  }): GasData => {
    const {
      gasLimit,
      gasPrice,
      maxPriorityFeePerGas,
      maxFeePerGas,
      setGasPrice = false,
    } = transactionRequest;

    let gasParams = {
      gasLimit,
    } as any;

    if (setGasPrice) {
      gasParams = maxPriorityFeePerGas
        ? {
            gasLimit,
            maxPriorityFeePerGas,
            maxFeePerGas,
          }
        : {
            gasLimit,
            gasPrice,
          };
    }

    return overrides ? { ...gasParams, ...overrides } : (gasParams as GasData);
  };

  async getTokensBalanceSupportingMultiCall(
    tokens: Token[],
    chainRpcUrl: string,
    userAddress?: string,
  ): Promise<TokenBalance[]> {
    if (!userAddress) return [];

    const multicallProvider = MulticallWrapper.wrap(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new ethers.JsonRpcProvider(chainRpcUrl),
    );

    const tokenBalances: Promise<TokenBalance>[] = tokens.map(token => {
      const isNativeToken = token.address.toLowerCase() === NATIVE_EVM_TOKEN_ADDRESS.toLowerCase();

      const contract = new ethers.Contract(
        isNativeToken ? MULTICALL_ADDRESS : token.address,
        isNativeToken
          ? multicallAbi
          : [
              {
                name: "balanceOf",
                type: "function",
                inputs: [{ name: "_owner", type: "address" }],
                outputs: [{ name: "balance", type: "uint256" }],
                stateMutability: "view",
              },
            ],
        multicallProvider as unknown as Provider,
      );

      const getTokenData = async () => {
        const { decimals, symbol, address, chainId } = token;

        let balance: string;

        try {
          const balanceInWei =
            await contract[isNativeToken ? "getEthBalance" : "balanceOf"](userAddress);

          balance = balanceInWei.toString();
        } catch (error) {
          balance = "0";
        }

        return {
          balance,
          symbol,
          address,
          decimals,
          chainId,
        };
      };

      return getTokenData();
    });

    try {
      return Promise.all(tokenBalances);
    } catch (error) {
      return [];
    }
  }

  async getTokensBalanceWithoutMultiCall(
    tokens: Token[],
    userAddress: string,
    rpcUrlsPerChain: {
      [chainId: string]: string;
    },
  ): Promise<TokenBalance[]> {
    const balances: (TokenBalance | null)[] = await Promise.all(
      tokens.map(async t => {
        let balance: TokenBalance | null;
        try {
          if (t.address === NATIVE_EVM_TOKEN_ADDRESS) {
            balance = await this.fetchBalance({
              token: t,
              userAddress,
              rpcUrl: rpcUrlsPerChain[t.chainId],
            });
          } else {
            balance = await this.fetchBalance({
              token: t,
              userAddress,
              rpcUrl: rpcUrlsPerChain[t.chainId],
            });
          }

          return balance;
        } catch (error) {
          return null;
        }
      }),
    );

    // filter out null values
    return balances.filter(Boolean) as TokenBalance[];
  }

  async fetchBalance({
    token,
    userAddress,
    rpcUrl,
  }: {
    token: Token;
    userAddress: string;
    rpcUrl: string;
  }): Promise<TokenBalance | null> {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
      const tokenContract = new ethers.Contract(token.address ?? "", tokenAbi, provider);

      const balance = (await tokenContract.balanceOf(userAddress)) ?? "0";

      if (!token) return null;

      const { decimals, symbol, address, chainId } = token;

      return {
        address,
        // balance in wei
        balance: parseInt(balance, 16).toString(),
        decimals,
        symbol,
        chainId,
      };
    } catch (error) {
      return null;
    }
  }
}
