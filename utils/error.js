class ResponseError extends Error {
  constructor(statusCode, message) {
    super(message || "Internal Server Error");
    this.statusCode = statusCode;
  }
}

export { ResponseError };
