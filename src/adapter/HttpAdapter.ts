import axios, { AxiosInstance } from "axios";
import { omit } from "lodash";

import { HttpResponse, RequestConfig } from "../types/http";

export default class HttpAdapter {
  axios: AxiosInstance;

  constructor(config: RequestConfig) {
    this.axios = axios.create({
      ...omit(config, ["config"]),
      baseURL: config?.baseUrl
    });

    if (config) {
      this.setConfig(config);
    }
  }

  setConfig(config: RequestConfig) {
    if (!config) throw new Error("config object undefined");
    this.axios = axios.create({ ...config, baseURL: config.baseUrl });
  }

  get = async (
    url: string,
    headers?: { [key: string]: any }
  ): Promise<HttpResponse> => {
    const { status, data } = await this.axios.get(url, { headers });
    return { status, data };
  };

  post = async (
    url: string,
    data: { [key: string]: any },
    headers?: { [key: string]: any }
  ): Promise<HttpResponse> => {
    const { status, data: _data } = await this.axios.post(url, data, {
      headers
    });
    return { status, data: _data };
  };
}
