import { Config } from ".";

export interface HttpResponse {
  status: number;
  data: any;
  headers?: any;
}

export interface RequestConfig {
  baseUrl?: string;
  config?: Config;
  headers?: Record<string, string | number | boolean>;
}
