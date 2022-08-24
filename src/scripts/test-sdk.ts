import * as dotenv from "dotenv";

import { Environment } from "../types";
import { Squid } from "../index";
import yargs from "yargs/yargs";
import {
  sendTradeAvalanche,
  sendTradeEthereum,
  sendTradeMoonbeam
} from "./sendTrade";
import {
  tradeSendAvalanche,
  tradeSendEthereum,
  tradeSendMoonbeam
} from "./tradeSend";
import {
  tradeSendTradeAvalanche,
  tradeSendTradeEthereum,
  tradeSendTradeMoonbeam
} from "./tradeSendTrade";

dotenv.config();
const parser = yargs(process.argv.slice(2)).options({
  s: { type: "string", default: "", alias: "suit" }
});

const getSDK = (env: Environment): Squid => {
  const squidSdk = new Squid({
    environment: env,
    baseUrl: "http://localhost:3000"
  });
  return squidSdk;
};

(async () => {
  const squidSdk = getSDK(Environment.LOCAL);
  await squidSdk.init();
  const argv = await parser.argv;
  console.log();
  const all = argv.s === "";
  try {
    if (all || argv.s === "sendtrade") {
      console.log(`\n> Running SendTrade`);
      await sendTradeEthereum(squidSdk);
      await sendTradeAvalanche(squidSdk);
      await sendTradeMoonbeam(squidSdk);
    }

    if (all || argv.s === "tradesend") {
      console.log(`\n> Running TradeSend`);
      await tradeSendEthereum(squidSdk);
      await tradeSendAvalanche(squidSdk);
      await tradeSendMoonbeam(squidSdk);
    }

    if (all || argv.s === "tradesendtrade") {
      console.log(`\n> Running TradeSendTrade`); // TODO: REVIEW WHY SOMETIMES TRADESENDTRADES FAILS
      await tradeSendTradeEthereum(squidSdk);
      await tradeSendTradeAvalanche(squidSdk);
      await tradeSendTradeMoonbeam(squidSdk);
    }
  } catch (error) {
    console.error(error);
  }
})();
