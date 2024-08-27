import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

//Handle CastErrors - Type convertion failure due to input incompatibility
const handleCastErrorDB = (error: any) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 404);
};

// Handle duplicate values for unique fields in the DB
const handleDuplicateDB = (error: any) => {
  const message = `Duplicate field value: ${error.keyValue.name}. Please use another value`;
  return new AppError(message, 404);
};

//Handle validations set in the schema
const handleValidationError = (error: any) => {
  const errors = Object.values(error).map((el: any) => el.message);
  const message = `Invalid input data. ${error.join(". ")}`;
  return new AppError(message, 400);
};

// Invalid JWT Token
const handleJWTError = () => {
  new AppError("Invalid toke. Please login again", 401);
};

// Expired JWT TOKEN
const handleJWTExpiredError = () => {
  new AppError("You're token has expired! Please login again", 401);
};

// Function to handle Errors in development
const sendErrorDev = (err: any, req: Request, res: Response) => {
  console.error("Error 💥", err);
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//Function to handle Errors in production
const sendErrorProd = (err: any, req: Request, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.error("Error 💥", err);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong",
  });
};

// Main Controller
module.exports = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // let error = JSON.stringify(err);
    let error = JSON.parse(err);
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.name === 11000) error = handleDuplicateDB(error);
    if (err.name === "ValidationError") error = handleValidationError(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
