export enum ErrorType {
  UnknownError = "UnknownError",
  ValidationError = "ValidationError",
  InitError = "InitError"
}

export type ErrorConstructor = {
  message: string;
  errorType: ErrorType | string;
  error?: any;
  logErrors?: boolean;
};

export class SquidError extends Error {
  errorType: string;
  error: any;
  logErrors = false;

  constructor({ message, errorType, logErrors, error }: ErrorConstructor) {
    super(message);
    this.message = message;
    this.errorType = errorType;
    this.error = error;
    this.logErrors = !!logErrors;

    Object.setPrototypeOf(this, SquidError.prototype);

    if (this.logErrors) {
      console.error(`Error type ${errorType}: ${message}`);
    }
  }
}
