import * as dotenv from "dotenv";

import { Environment } from "../types";
import SquidSdk from "../index";

import {
  sendTradeAvalance,
  sendTradeEthereum,
  sendTradeMoonbeam
} from "./sendTrade";
import {
  tradeSendAvalance,
  tradeSendEthereum,
  tradeSendMoonbeam
} from "./tradeSend";

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
    console.log("\n\n");
    console.log(`> Running SendTrade`);
    console.log("\n");
    await sendTradeEthereum(squidSdk);
    await sendTradeAvalance(squidSdk);
    await sendTradeMoonbeam(squidSdk);

    console.log("\n\n");
    console.log(`> Running TradeSend`);
    console.log("\n");
    await tradeSendEthereum(squidSdk);
    await tradeSendAvalance(squidSdk);
    await tradeSendMoonbeam(squidSdk);
  } catch (error) {
    console.error(error);
  }
})();
