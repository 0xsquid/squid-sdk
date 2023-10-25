import { ethers } from "ethers";
import { Multicall, ContractCallContext } from "ethereum-multicall";
import { TokenBalance, TokenData } from "types";
import {
  NATIVE_EVM_TOKEN_ADDRESS,
  multicallAbi,
  MULTICALL_ADDRESS
} from "../constants";

type ContractAddress = `0x${string}`;

const CHAINS_WITHOUT_MULTICALL = [314, 3141]; // Filecoin, & Filecoin testnet
const CHAINS_WITHOUT_MULTICALL_RPC_URLS: Record<number, string> = {
  314: "https://rpc.ankr.com/filecoin",
  3141: "https://rpc.ankr.com/filecoin"
};

const getTokensBalanceSupportingMultiCall = async (
  tokens: TokenData[],
  userAddress?: ContractAddress
): Promise<TokenBalance[]> => {
  if (!userAddress) return [];

  const ETHEREUM_RPC_URL = "https://eth.meowrpc.com";
  const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_URL);

  const contractCallContext: ContractCallContext[] = tokens.map(token => {
    const isNativeToken =
      token.address.toLowerCase() === NATIVE_EVM_TOKEN_ADDRESS.toLowerCase();

    return {
      abi: isNativeToken
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
      contractAddress: isNativeToken ? MULTICALL_ADDRESS : token.address,
      reference: token.symbol,
      calls: [
        {
          reference: isNativeToken ? "getEthBalance" : "balanceOf",
          methodName: isNativeToken ? "getEthBalance" : "balanceOf",
          methodParameters: [userAddress]
        }
      ]
    };
  });

  const multicallInstance = new Multicall({
    ethersProvider: provider,
    tryAggregate: true
  });

  const { results } = (await multicallInstance.call(contractCallContext)) ?? {
    results: {}
  };

  const tokenBalances: TokenBalance[] = [];

  for (const symbol in results) {
    const data = results[symbol].callsReturnContext[0] ?? {};

    const { decimals = 18, address = "0x" } =
      tokens.find(t => t.symbol === symbol) ?? {};

    const mappedBalance: TokenBalance = {
      symbol,
      address,
      decimals,
      // balance in wei
      balance: parseInt(data.returnValues[0]?.hex ?? "0", 16).toString()
    };

    tokenBalances.push(mappedBalance);
  }

  return tokenBalances;
};

const getTokensBalanceWithoutMultiCall = async (
  tokens: TokenData[],
  userAddress: ContractAddress
): Promise<TokenBalance[]> => {
  const balances: (TokenBalance | null)[] = await Promise.all(
    tokens.map(async t => {
      let balance: TokenBalance | null;
      try {
        if (t.address === NATIVE_EVM_TOKEN_ADDRESS) {
          balance = await fetchBalance({
            token: t,
            userAddress
          });
        } else {
          balance = await fetchBalance({
            token: t,
            userAddress
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
  evmTokens: TokenData[],
  userAddress: string
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
      [[], []] as TokenData[][]
    );

    const tokensNotSupportingMulticall = splittedTokensByMultiCallSupport[0];
    const tokensSupportingMulticall = splittedTokensByMultiCallSupport[1];

    const tokensMulticall = await getTokensBalanceSupportingMultiCall(
      tokensSupportingMulticall,
      userAddress as ContractAddress
    );

    const tokensNotMultiCall = await getTokensBalanceWithoutMultiCall(
      tokensNotSupportingMulticall,
      userAddress as ContractAddress
    );

    return [...tokensMulticall, ...tokensNotMultiCall];
  } catch (error) {
    console.error(error);
    return [];
  }
};

type FetchBalanceParams = {
  token: TokenData;
  userAddress: ContractAddress;
};

async function fetchBalance({
  token,
  userAddress
}: FetchBalanceParams): Promise<TokenBalance | null> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      CHAINS_WITHOUT_MULTICALL_RPC_URLS[Number(token.chainId)]
    );

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
