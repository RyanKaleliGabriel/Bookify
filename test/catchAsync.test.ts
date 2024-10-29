import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  jest,
  test,
} from "@jest/globals";
import { Request, Response, NextFunction } from "express";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

describe("catchAsync", () => {
  test("should call next with an error if the async function rejects", async () => {
    const req: Request = {} as Request; // Mock request object
    const res: Response = {} as Response; // Mock response object
    const next: NextFunction = jest.fn() as NextFunction; // Mock next function

    const asyncFunction = jest
      .fn<() => Promise<any>>()
      .mockRejectedValue(new Error("Test error"));
    const wrappedFunction = catchAsync(asyncFunction);
    await wrappedFunction(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error)); // Check that next is called with an error
    // expect.any(constructor) matches anything that was created with the given constructor or if it's a primitive that is of the passed type
    expect(asyncFunction).toHaveBeenCalledWith(req, res, next); //Cehck thatvthe original value was called
  });

  test("should call the async function without errors if it resolves", async () => {
    const req: Request = {} as Request; // Mock request object
    const res: Response = {} as Response; // Mock response object
    const next: NextFunction = jest.fn() as NextFunction; // Mock next function

    const asyncFunction = jest.fn(() => Promise.resolve("Success"));
    const wrappedFunction = catchAsync(asyncFunction);
    await wrappedFunction(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(asyncFunction).toHaveBeenCalledWith(req, res, next);
  });
});
