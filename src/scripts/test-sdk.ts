import { Environment } from "../types";
import SquidSdk from "../index";
import {
  sendTradeAvalance,
  sendTradeEthereum,
  sendTradeMoonbeam
} from "./sendTrade";

import * as dotenv from "dotenv";
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
    console.log(`Running SendTrade`);
    await sendTradeEthereum(squidSdk);
    await sendTradeAvalance(squidSdk);
    await sendTradeMoonbeam(squidSdk);
  } catch (error) {
    console.error(error);
  }
})();
