import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import APIfeatures from "../utils/apiFeatures";

describe("APIfeatures", () => {
  // Correct mock typings will be inferred if implementation is passed to jest.fn().
  let mockQuery: any;
  beforeEach(() => {
    // Reset the mock query object before each test
    // find, sort, select, skip, and limit: These are common Mongoose query methods used in your APIfeatures class.
    // By mocking these, you simulate the behavior of a real Mongoose query but without needing a real database connection.
    // jest.fn(): Creates a mock function that can be called and tested within Jest.

    // .mockReturnThis(): Ensures that each method (e.g., find, sort) returns the mockQuery object itself.
    // This mimics the "chaining" behavior in Mongoose, where calling a query method (like find()) returns the query object,
    // allowing other methods (like sort() and skip()) to be chained onto it. By returning mockQuery with .mockReturnThis(),
    // you simulate this chaining.
    mockQuery = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
  });

  test("filter() should filter query based on query string operators", () => {
    const queryString = { minutes: { gte: "25" } };
    const apiFeatures = new APIfeatures(mockQuery, queryString);

    apiFeatures.filter();

    // Use .toHaveBeenCalledWith to ensure that a mock function was called with specific arguments
    expect(mockQuery.find).toHaveBeenCalledWith({ minutes: { $gte: "25" } });
  });

  test("sort() should sort query based on query string", () => {
    const queryString = { sort: "date,minutes" };

    const apiFeatures = new APIfeatures(mockQuery, queryString);
    apiFeatures.sort();

    expect(mockQuery.sort).toHaveBeenCalledWith("date minutes");
  });

  test("limitFields() should select a specific field based on the query string", () => {
    const queryString = { fields: "status,reason" };
    const apiFeatures = new APIfeatures(mockQuery, queryString);

    apiFeatures.limitFields();

    expect(mockQuery.select).toHaveBeenCalledWith("status reason");
  });

  test("limitFields() should exclude '__v' fields when no fields are specified", () => {
    const queryString = {};
    const apiFeatures = new APIfeatures(mockQuery, queryString);

    apiFeatures.limitFields();

    expect(mockQuery.select).toHaveBeenCalledWith("-__v");
  });

  test("paginate() should apply pagination with default values", () => {
    const queryString = {};
    const apiFeatures = new APIfeatures(mockQuery, queryString);

    apiFeatures.paginate();

    expect(mockQuery.skip).toHaveBeenCalledWith(0);
    expect(mockQuery.limit).toHaveBeenCalledWith(3);
  });

  test("paginate() should applpagination with custom values", () => {
    const queryString = { page: "2", limit: "5" };
    const apiFeatures = new APIfeatures(mockQuery, queryString);

    apiFeatures.paginate();

    expect(mockQuery.skip).toHaveBeenCalledWith(5);
    expect(mockQuery.limit).toHaveBeenCalledWith(5);
  });
});
