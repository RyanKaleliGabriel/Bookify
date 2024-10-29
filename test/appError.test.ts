import AppError from "../utils/appError";

import { beforeEach, describe, expect, jest, test } from "@jest/globals";

describe("AppError", () => {
  test("should set the correct properties when statusCode starts with 4", () => {
    const message = "Not Found";
    const statusCode = 404;
    const error = new AppError(message, statusCode);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.status).toBe("fail");
    expect(error.isOperational).toBe(true);
    expect(error).toHaveProperty("stack"); // should capture stack tree
  });

  test("should set the correct properties when statusCode starts with 5", () => {
    const message = "Internal Sever Error";
    const statusCode = 500;
    const error = new AppError(message, statusCode);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe("Error");
    expect(error.isOperational).toBe(true);
    expect(error).toHaveProperty("stack");
  });

  test("should set a custom stack trace", () => {
    const message = "Custom stack trace error";
    const statusCode = 400;
    const error = new AppError(message, statusCode);

    expect(error.stack).toContain(message);
  });
});
