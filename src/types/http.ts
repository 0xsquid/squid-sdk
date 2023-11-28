import { AxiosResponse } from "axios";
import { Config } from ".";

export type HttpResponse = AxiosResponse;

export interface RequestConfig {
  baseUrl?: string;
  config?: Config;
  headers?: Record<string, string | number | boolean>;
  timeout?: number;
}
