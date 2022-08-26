import * as dotenv from "dotenv";

import { ChainName, Environment } from "../types";
import { Squid } from "../index";
import yargs from "yargs/yargs";
import { sendTrade } from "./sendTrade";
import { tradeSend } from "./tradeSend";
import { tradeSendTrade } from "./tradeSendTrade";

dotenv.config();
const parser = yargs(process.argv.slice(2)).options({
  s: { type: "string", default: "", alias: "suite" }
});

const getSDK = (env: Environment): Squid => {
  const squid = new Squid({
    environment: env,
    baseUrl: "http://localhost:3000"
  });
  return squid;
};

(async () => {
  const squid = getSDK(Environment.LOCAL);
  await squid.init();
  const argv = await parser.argv;
  const all = argv.s === "";
  const ethereumDests = [ChainName.AVALANCHE, ChainName.MOONBEAM];
  const avalancheDests = [ChainName.ETHEREUM, ChainName.MOONBEAM];
  const moonbeamDests = [ChainName.ETHEREUM, ChainName.AVALANCHE];

  try {
    if (all || argv.s === "sendtrade") {
      console.log(`\n> Running SendTrade`);
      await sendTrade(squid, ChainName.ETHEREUM, ethereumDests, "0.001");
      await sendTrade(squid, ChainName.AVALANCHE, avalancheDests, "0.1");
      await sendTrade(squid, ChainName.MOONBEAM, moonbeamDests, "0.1");
    }

    if (all || argv.s === "tradesend") {
      console.log(`\n> Running TradeSend`);
      await tradeSend(squid, ChainName.ETHEREUM, ethereumDests, "0.001");
      await tradeSend(squid, ChainName.AVALANCHE, avalancheDests, "0.1");
      await tradeSend(squid, ChainName.MOONBEAM, moonbeamDests, "0.1");
    }

    if (all || argv.s === "tradesendtrade") {
      console.log(`\n> Running TradeSendTrade`); // TODO: REVIEW WHY SOMETIMES TRADESENDTRADES FAILS
      await tradeSendTrade(squid, ChainName.ETHEREUM, ethereumDests, "0.001");
      await tradeSendTrade(squid, ChainName.AVALANCHE, avalancheDests, "0.1");
      await tradeSendTrade(squid, ChainName.MOONBEAM, moonbeamDests, "0.1");
    }
  } catch (error) {
    console.error(error);
  }
})();
