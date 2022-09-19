import * as dotenv from "dotenv";

import { ChainName } from "../types";
import { Squid } from "../index";
import yargs from "yargs/yargs";
import { sendTrade } from "./sendTrade";
import { tradeSend, tradeSendCosmos } from "./tradeSend";
import { tradeSendTrade } from "./tradeSendTrade";
import { sendOnly, sendOnlyCosmos } from "./sendOnly";

dotenv.config();
const parser = yargs(process.argv.slice(2)).options({
  s: { type: "string", default: "", alias: "suite" }
});

const getSDK = (): Squid => {
  const squid = new Squid({
    baseUrl: "http://localhost:3000"
  });
  return squid;
};

(async () => {
  const squid = getSDK();
  await squid.init();
  const argv = await parser.argv;
  const all = argv.s === "";
  const ethereumDests = [
    ChainName.AVALANCHE,
    ChainName.MOONBEAM,
    ChainName.POLYGON
  ];
  const avalancheDests = [
    ChainName.ETHEREUM,
    ChainName.MOONBEAM,
    ChainName.POLYGON
  ];
  const moonbeamDests = [
    ChainName.ETHEREUM,
    ChainName.AVALANCHE,
    ChainName.POLYGON
  ];
  const polygonDests = [
    ChainName.ETHEREUM,
    ChainName.AVALANCHE,
    ChainName.MOONBEAM
  ];
  const cosmosDests = [ChainName.KUJIRA];
  const kujiraDestAddress = "kujira1xmp9qkcnfz7zcxu3xd6ywcf4zge73uny8g3jhu";
  try {
    if (all || argv.s === "sendtrade") {
      console.log(`\n> Running SendTrade`);
      await sendTrade(squid, ChainName.ETHEREUM, ethereumDests, "1"); // USDC value
      await sendTrade(squid, ChainName.AVALANCHE, avalancheDests, "1"); // USDC value
      await sendTrade(squid, ChainName.MOONBEAM, moonbeamDests, "1"); // USDC value
      await sendTrade(squid, ChainName.POLYGON, polygonDests, "1"); // USDC value
    }

    if (all || argv.s === "tradesend") {
      console.log(`\n> Running TradeSend`);
      await tradeSend(squid, ChainName.ETHEREUM, ethereumDests, "0.001");
      await tradeSend(squid, ChainName.AVALANCHE, avalancheDests, "0.1");
      await tradeSend(squid, ChainName.MOONBEAM, moonbeamDests, "0.1");
      await tradeSend(squid, ChainName.POLYGON, polygonDests, "0.1");
    }

    if (all || argv.s === "tradesendtrade") {
      console.log(`\n> Running TradeSendTrade`);
      await tradeSendTrade(squid, ChainName.ETHEREUM, ethereumDests, "0.001");
      await tradeSendTrade(squid, ChainName.AVALANCHE, avalancheDests, "0.1");
      await tradeSendTrade(squid, ChainName.MOONBEAM, moonbeamDests, "0.1");
      await tradeSendTrade(squid, ChainName.POLYGON, polygonDests, "0.001");
    }

    if (all || argv.s === "sendOnly") {
      console.log(`\n> Running SendOnly`);
      await sendOnly(squid, ChainName.ETHEREUM, ethereumDests, "20");
      await sendOnly(squid, ChainName.AVALANCHE, avalancheDests, "20");
      await sendOnly(squid, ChainName.MOONBEAM, moonbeamDests, "20");
      await sendOnly(squid, ChainName.POLYGON, polygonDests, "20");
    }

    if (argv.s === "cosmosOnly" || argv.s === "sendOnlyCosmos") {
      console.log(`\n> Running SendOnlyCosmos`);
      await sendOnlyCosmos(
        squid,
        ChainName.ETHEREUM,
        cosmosDests,
        "1",
        kujiraDestAddress
      );
    }

    if (argv.s === "cosmosOnly" || argv.s === "tradeSendCosmos") {
      console.log(`\n> Running tradeSendCosmos`);
      await tradeSendCosmos(
        squid,
        ChainName.ETHEREUM,
        cosmosDests,
        "0.001",
        kujiraDestAddress
      );
    }
  } catch (error) {
    console.error(error);
  }
})();
