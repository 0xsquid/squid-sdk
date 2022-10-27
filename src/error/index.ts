export enum ErrorType {
  UnknownError = "UnknownError",
  ValidationError = "ValidationError",
  InitError = "InitError"
}

export type LogLevel = "info" | "error" | "debug";

export type ErrorConstructor = {
  message: string;
  errorType: ErrorType | string;
  error?: any;
  loggin?: boolean;
  logLevel?: LogLevel;
};

export class SquidError extends Error {
  errorType: string;
  error: any;
  loggin = false;
  logLevel;

  constructor({
    message,
    errorType,
    loggin,
    error,
    logLevel
  }: ErrorConstructor) {
    super(message);
    this.message = message;
    this.errorType = errorType;
    this.error = error;
    this.loggin = !!loggin;
    this.logLevel = logLevel;

    Object.setPrototypeOf(this, SquidError.prototype);

    if (this.loggin) {
      if (this.logLevel === "error") {
        console.error(`Error type ${errorType}: ${message}`);
      }
      if (this.logLevel === "debug") {
        console.debug(`Error type ${errorType}: ${message}`);
      }
      if (this.logLevel === "info") {
        console.info(`Error type ${errorType}: ${message}`);
      }
    }
  }
}
