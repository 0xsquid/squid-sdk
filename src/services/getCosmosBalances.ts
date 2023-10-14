import { StargateClient } from "@cosmjs/stargate";
import { utils } from "ethers";
import { ChainData, ChainType } from "../types";

export async function getCosmosBalances({
  addresses,
  cosmosChains
}: {
  addresses: { chainId: string; address: string }[];
  cosmosChains: ChainData[];
}) {
  const balances: {
    amount: string;
    denom: string;
  }[][] = [];

  for (const { address, chainId } of addresses) {
    const chain = cosmosChains.find(c => c.chainId === chainId);

    // skip iteration if chain is not of type Cosmos
    // or if chain is not found
    if (!chain || chain.chainType !== ChainType.Cosmos) continue;

    const client = await StargateClient.connect(chain.rpc);

    // Rpc could be wrong or rate limited, need to catch errors
    try {
      const chainBalances = await client.getAllBalances(address);

      balances.push(
        chainBalances.map(balanceAsCoin => ({
          amount: utils.formatUnits(
            balanceAsCoin.amount,
            balanceAsCoin.denom === "uatom" ? 6 : 0
          ),
          denom: balanceAsCoin.denom
        }))
      );
    } catch (error) {
      balances.push([]);
    }
  }

  return balances;
}
