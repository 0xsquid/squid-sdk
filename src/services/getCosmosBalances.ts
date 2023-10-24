import { StargateClient } from "@cosmjs/stargate";
import { ChainType, CosmosAddress, CosmosBalance, CosmosChain } from "../types";
import { fromBech32, toBech32 } from "@cosmjs/encoding";

const deriveCosmosAddress = (chainPrefix: string, address: string): string => {
  return toBech32(chainPrefix, fromBech32(address).data);
};

export async function getCosmosBalances({
  addresses,
  cosmosChains
}: {
  addresses: CosmosAddress[];
  cosmosChains: CosmosChain[];
}): Promise<CosmosBalance[]> {
  const balances: CosmosBalance[] = [];

  for (const chain of cosmosChains) {
    if (chain.chainType !== ChainType.Cosmos) continue;

    const addressData = addresses.find(
      address => address.coinType === chain.coinType
    );

    if (!addressData) continue;

    const cosmosAddress = deriveCosmosAddress(
      chain.bech32Config.bech32PrefixAccAddr,
      addressData.address
    );

    try {
      const client = await StargateClient.connect(chain.rpc);
      const [account] = (await client.getAllBalances(cosmosAddress)) ?? [];

      if (!account) continue;

      const { amount, denom } = account;

      balances.push({
        amount,
        denom,
        chainId: String(chain.chainId)
      });
    } catch (error) {
      //
    }
  }

  return balances;
}
