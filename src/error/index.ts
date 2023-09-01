export class SquidError extends Error {
  constructor(message: string) {
    super(message); // Pass the message up to the Error constructor
    this.name = "SquidError"; // Set the name property of the error

    // This is to ensure that instanceof checks work correctly,
    // given that we are extending a built-in class.
    Object.setPrototypeOf(this, SquidError.prototype);
  }
}
