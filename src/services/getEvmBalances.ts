import { Provider, ethers } from "ethers";
import { MulticallWrapper } from "ethers-multicall-provider";
import { Token, TokenBalance } from "../types";
import {
  NATIVE_EVM_TOKEN_ADDRESS,
  multicallAbi,
  MULTICALL_ADDRESS
} from "../constants";

type ContractAddress = `0x${string}`;

const CHAINS_WITHOUT_MULTICALL = [314, 3141]; // Filecoin, & Filecoin testnet

const getTokensBalanceSupportingMultiCall = async (
  tokens: Token[],
  chainRpcUrl: string,
  userAddress?: ContractAddress
): Promise<TokenBalance[]> => {
  if (!userAddress) return [];

  const multicallProvider = MulticallWrapper.wrap(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new ethers.JsonRpcProvider(chainRpcUrl)
  );

  const tokenBalances: Promise<TokenBalance>[] = tokens.map(token => {
    const isNativeToken =
      token.address.toLowerCase() === NATIVE_EVM_TOKEN_ADDRESS.toLowerCase();

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
              stateMutability: "view"
            }
          ],
      multicallProvider as unknown as Provider
    );

    const getTokenData = async () => {
      const balanceInWei = await contract[
        isNativeToken ? "getEthBalance" : "balanceOf"
      ](userAddress);

      return {
        balance: balanceInWei.toString(),
        symbol: token.symbol,
        address: token.address,
        decimals: token.decimals,
        chainId: token.chainId
      };
    };

    return getTokenData();
  });

  try {
    return Promise.all(tokenBalances);
  } catch (error) {
    return [];
  }
};

const getTokensBalanceWithoutMultiCall = async (
  tokens: Token[],
  userAddress: ContractAddress,
  rpcUrlsPerChain: {
    [chainId: string]: string;
  }
): Promise<TokenBalance[]> => {
  const balances: (TokenBalance | null)[] = await Promise.all(
    tokens.map(async t => {
      let balance: TokenBalance | null;
      try {
        if (t.address === NATIVE_EVM_TOKEN_ADDRESS) {
          balance = await fetchBalance({
            token: t,
            userAddress,
            rpcUrl: rpcUrlsPerChain[t.chainId]
          });
        } else {
          balance = await fetchBalance({
            token: t,
            userAddress,
            rpcUrl: rpcUrlsPerChain[t.chainId]
          });
        }

        return balance;
      } catch (error) {
        return null;
      }
    })
  );

  // filter out null values
  return balances.filter(Boolean) as TokenBalance[];
};

export const getAllEvmTokensBalance = async (
  evmTokens: Token[],
  userAddress: string,
  chainRpcUrls: {
    [chainId: string]: string;
  }
): Promise<TokenBalance[]> => {
  try {
    // Some tokens don't support multicall, so we need to fetch them with Promise.all
    // TODO: Once we support multicall on all chains, we can remove this split
    const splittedTokensByMultiCallSupport = evmTokens.reduce(
      (acc, token) => {
        if (CHAINS_WITHOUT_MULTICALL.includes(Number(token.chainId))) {
          acc[0].push(token);
        } else {
          acc[1].push(token);
        }
        return acc;
      },
      [[], []] as Token[][]
    );

    const tokensNotSupportingMulticall = splittedTokensByMultiCallSupport[0];
    const tokensSupportingMulticall = splittedTokensByMultiCallSupport[1];

    const tokensByChainId = tokensSupportingMulticall.reduce(
      (groupedTokens, token) => {
        if (!groupedTokens[token.chainId]) {
          groupedTokens[token.chainId] = [];
        }

        groupedTokens[token.chainId].push(token);

        return groupedTokens;
      },
      {} as Record<string, Token[]>
    );

    const tokensMulticall: TokenBalance[] = [];

    for (const chainId in tokensByChainId) {
      const tokens = tokensByChainId[chainId];
      const rpcUrl = chainRpcUrls[chainId];

      if (!rpcUrl) continue;

      const tokensBalances = await getTokensBalanceSupportingMultiCall(
        tokens,
        rpcUrl,
        userAddress as ContractAddress
      );

      tokensMulticall.push(...tokensBalances);
    }

    const tokensNotMultiCall = await getTokensBalanceWithoutMultiCall(
      tokensNotSupportingMulticall,
      userAddress as ContractAddress,
      chainRpcUrls
    );

    return [...tokensMulticall, ...tokensNotMultiCall];
  } catch (error) {
    return [];
  }
};

type FetchBalanceParams = {
  token: Token;
  userAddress: ContractAddress;
  rpcUrl: string;
};

async function fetchBalance({
  token,
  userAddress,
  rpcUrl
}: FetchBalanceParams): Promise<TokenBalance | null> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
    const tokenContract = new ethers.Contract(
      token.address ?? "",
      tokenAbi,
      provider
    );

    const balance = (await tokenContract.balanceOf(userAddress)) ?? "0";

    if (!token) return null;

    const { decimals, symbol, address } = token;

    return {
      address,
      // balance in wei
      balance: parseInt(balance, 16).toString(),
      decimals,
      symbol
    };
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return null;
  }
}
