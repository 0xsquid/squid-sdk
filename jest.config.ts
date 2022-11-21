import type { Config } from "jest";
import { defaults } from "jest-config";

const config: Config = {
  moduleDirectories: ["node_modules", "src"]
};

export default config;
