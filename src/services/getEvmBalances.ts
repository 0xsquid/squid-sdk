import { BigNumber, ethers, constants } from "ethers";
import { Multicall, ContractCallContext } from "ethereum-multicall";
import { TokenBalance, TokenData } from "types";

const supportedTokens: TokenData[] = [];

const NATIVE_EVM_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";
const multicallAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "getEthBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

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

  return nonNativeTokenBalances.map(({ symbol, value }) => {
    const token = tokens.find(t => t.symbol === symbol);

    return {
      symbol,
      address: token?.address ?? "0x",
      balanceInWei: ethers.utils.formatUnits(value),
      decimal: token?.decimals ?? 18,
      decimalBalance: "0"
    };
  });
};

const getTokensBalanceWithoutMultiCall = async (
  tokens: TokenData[],
  userAddress: ContractAddress
): Promise<TokenBalance[]> => {
  const balances = await Promise.all(
    tokens.map(async t => {
      let balance: FetchBalanceResult | null;
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
        return {
          decimals: t.decimals,
          formatted: "0",
          symbol: t.symbol,
          value: constants.Zero
        };
      }
    })
  );

  const formattedBalances = balances.map(balance => {
    const {
      decimals,
      formatted = "0",
      symbol = "",
      value = "0"
    } = balance ?? {};

    return {
      symbol,
      address: tokens.find(t => t.symbol === symbol)?.address ?? "0x",
      balanceInWei: formatted,
      decimal: decimals ?? 18,
      decimalBalance: value.toString()
    };
  });

  return formattedBalances;
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

type FetchBalanceResult = {
  decimals: number;
  formatted: string;
  symbol: string;
  value: BigNumber;
};

type FetchBalanceParams = {
  address: string;
  chainId: number;
  token?: string;
};

async function fetchBalance({
  address,
  chainId,
  token
}: FetchBalanceParams): Promise<FetchBalanceResult | null> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      getRpcUrl(Number(chainId)) ?? ""
    );

    const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
    const tokenContract = new ethers.Contract(token ?? "", tokenAbi, provider);

    const balance = await tokenContract.balanceOf(address);

    console.log("balance -->", balance);

    const tokenData = supportedTokens.find(t => t.address === token);

    if (!tokenData) return null;

    const { decimals, symbol } = tokenData;

    return {
      decimals: decimals ?? 18,
      formatted: ethers.utils.formatUnits(balance, decimals ?? 18),
      symbol,
      value: balance
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
) {
  const provider = ethers.getDefaultProvider();

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
        contractAddress: isNativeToken ? multicallAddress : token.address,
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
    const transformedData = {
      symbol,
      value: data.returnValues[0]?.hex ?? "0x000",
      success: data.success
    };
    resultArray.push(transformedData);
  }

  return resultArray;
}
