import axios, { AxiosInstance } from "axios";
import { omit } from "lodash";

import { ErrorType, SquidError } from "../error";
import { HttpResponse, RequestConfig } from "../types/http";

export default class HttpAdapter {
  axios: AxiosInstance;

  constructor(config: RequestConfig) {
    this.axios = axios.create({
      ...omit(config, ["config"]),
      baseURL: config?.baseUrl
    });

    this.axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          return Promise.reject(
            new SquidError({
              message: error.response.statusText,
              errorType: error.response.data.errors[0].errorType,
              errors: error.response.data.errors,
              logging: config.config?.logging,
              logLevel: config.config?.logLevel
            })
          );
        }

        return Promise.reject(
          new SquidError({
            message: "There was an error while trying to fetch Squid Api",
            errorType: ErrorType.UnknownError,
            errors: [error],
            logging: config.config?.logging,
            logLevel: config.config?.logLevel
          })
        );
      }
    );

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
    const { status, data } = await this.axios.get(url, headers);
    return { status, data };
  };

  post = async (
    url: string,
    data: { [key: string]: any },
    headers?: { [key: string]: any }
  ): Promise<HttpResponse> => {
    const { status, data: _data } = await this.axios.post(url, data, headers);
    return { status, data: _data };
  };
}
