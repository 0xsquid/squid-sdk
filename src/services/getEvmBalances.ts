import { ethers } from "ethers";
import { Multicall, ContractCallContext } from "ethereum-multicall";
import { TokenBalance, TokenData } from "types";
import {
  NATIVE_EVM_TOKEN_ADDRESS,
  multicallAbi,
  MULTICALL_ADDRESS
} from "../constants";

type ContractAddress = `0x${string}`;

const getTokensBalanceSupportingMultiCall = async (
  tokens: TokenData[],
  userAddress?: ContractAddress
): Promise<TokenBalance[]> => {
  if (!userAddress) return [];

  const nonNativeTokenBalances = await getMulticallTokensBalance(
    tokens,
    userAddress
  );

  // TODO: get native token balance

  return nonNativeTokenBalances;
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
            address: userAddress,
            chainId: +t.chainId
          });
        } else {
          balance = await fetchBalance({
            address: userAddress,
            chainId: +t.chainId,
            token: t.address as ContractAddress
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
    const chainWithoutMulticall = [314, 3141]; // Filecoin, & Filecoin testnet
    const splittedTokensByMultiCallSupport = evmTokens.reduce(
      (acc, token) => {
        if (chainWithoutMulticall.includes(+token.chainId)) {
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
  address: string;
  chainId: number;
  token?: string;
};

async function fetchBalance({
  address,
  chainId,
  token: tokenAddress = ""
}: FetchBalanceParams): Promise<TokenBalance | null> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      getRpcUrl(Number(chainId)) ?? ""
    );

    const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
    const tokenContract = new ethers.Contract(
      tokenAddress ?? "",
      tokenAbi,
      provider
    );

    const balance = await tokenContract.balanceOf(address);

    const tokenData = supportedTokens.find(t => t.address === tokenAddress);

    if (!tokenData) return null;

    const { decimals, symbol } = tokenData;

    return {
      address: tokenAddress,
      balanceInDecimal: balance.toString(),
      decimals,
      symbol
    };
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return null;
  }
}

function getRpcUrl(chainId: number) {
  const rpcUrls = {
    1: "https://eth.llamarpc.com",
    43114: "https://avax.meowrpc.com",
    8453: "https://1rpc.io/base"
  };

  return rpcUrls[chainId as keyof typeof rpcUrls] || null;
}

async function getMulticallTokensBalance(
  tokens: TokenData[],
  userAddress: ContractAddress
): Promise<TokenBalance[]> {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://eth.llamarpc.com"
  );

  const nonNativeTokenContractCallContext: ContractCallContext[] = tokens
    .filter(t => t.chainId === 1)
    .map(token => {
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

  const nonNativeTokensMulticall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true
  });

  const { results } = (await nonNativeTokensMulticall.call(
    nonNativeTokenContractCallContext
  )) ?? {
    results: {}
  };

  const resultArray = [];

  for (const symbol in results) {
    const data = results[symbol].callsReturnContext[0] ?? {};

    const { decimals = 18, address = "0x" } =
      tokens.find(t => t.symbol === symbol) ?? {};

    const balanceInDecimal = ethers.utils.formatUnits(
      data.returnValues[0]?.hex ?? "0x000",
      decimals
    );

    const transformedData: TokenBalance = {
      symbol,
      address,
      decimals,
      balanceInDecimal
    };
    resultArray.push(transformedData);
  }

  return resultArray;
}
