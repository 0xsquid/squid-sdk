import * as dotenv from "dotenv";

import { Environment } from "../types";
import SquidSdk from "../index";

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

const getSDK = (env: Environment): SquidSdk => {
  const squidSdk = new SquidSdk({
    environment: env,
    baseUrl: "http://localhost:3000"
  });
  return squidSdk;
};

(async () => {
  const squidSdk = getSDK(Environment.LOCAL);
  await squidSdk.init();
  try {
    console.log(`\n> Running SendTrade`);
    await sendTradeEthereum(squidSdk);
    await sendTradeAvalanche(squidSdk);
    await sendTradeMoonbeam(squidSdk);

    console.log(`\n> Running TradeSend`);
    await tradeSendEthereum(squidSdk);
    await tradeSendAvalanche(squidSdk);
    await tradeSendMoonbeam(squidSdk);

    console.log(`\n> Running TradeSendTrade`); // TODO: REVIEW WHY SOMETIMES TRADESENDTRADES FAILS
    await tradeSendTradeEthereum(squidSdk);
    await tradeSendTradeAvalanche(squidSdk);
    await tradeSendTradeMoonbeam(squidSdk);
  } catch (error) {
    console.error(error);
  }
})();
