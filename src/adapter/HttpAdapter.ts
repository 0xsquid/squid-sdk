import axios, { AxiosInstance } from "axios";
import { omit } from "lodash";

import { HttpResponse, RequestConfig } from "../types";

export default class HttpAdapter {
  axios: AxiosInstance;

  constructor(config: RequestConfig) {
    this.axios = axios.create({
      ...omit(config, ["config"]),
      baseURL: config?.baseUrl,
      timeout: config?.timeout,
    });

    if (config) {
      this.setConfig(config);
    }
  }

  setConfig(config: RequestConfig) {
    if (!config) throw new Error("config object undefined");
    this.axios = axios.create({ ...config, baseURL: config.baseUrl });
  }

  get = async (url: string, config?: { [key: string]: any }): Promise<HttpResponse> => {
    return await this.axios.get(url, config);
  };

  post = async (
    url: string,
    data: { [key: string]: any },
    config?: { [key: string]: any },
  ): Promise<HttpResponse> => {
    return await this.axios.post(url, data, config);
  };
}
