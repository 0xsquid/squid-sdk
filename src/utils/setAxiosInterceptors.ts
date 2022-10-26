import { AxiosInstance } from "axios";
import { ErrorType, SquidError } from "../error";

export const setAxiosInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        return Promise.reject(
          new SquidError({
            message: error.response.statusText,
            errorType: error.response.data.errorType,
            error: error.response.data.error
          })
        );
      }

      return Promise.reject(
        new SquidError({
          message: "There was an error while trying to fetch Squid Api",
          errorType: ErrorType.UnknownError,
          error: error
        })
      );
    }
  );

  return axiosInstance;
};
