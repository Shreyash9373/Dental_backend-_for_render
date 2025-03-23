import { ResponseError } from "../utils/error.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode ? err.statusCode : 500;
  const stack =
    process.env.NODE_ENV !== "production"
      ? err.stack.replace(/(\r\n|\n|\r)/gm, ":::").split(":::")
      : null; // replace any form of line break to make an array for better readability from stack

  if (err.name === "JsonWebTokenError")
    return res.status(401).json({
      success: false,
      message: "Invalid Access Token",
      stack,
    });
  if (err.name === "TokenExpiredError")
    return res.status(401).json({
      success: false,
      message: "Access Token Expired",
    });

  if (err instanceof ResponseError) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack,
  });
};
