import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import dotenv from "dotenv";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Client, { ClientDocument } from "../models/Client";

dotenv.config({ path: "../config.env" });
const TIME_IN_SECONDS = 10 * 1000;
jest.setTimeout(TIME_IN_SECONDS);

let user = {
  name: "Demo user",
  email: "demo@gmail.com",
  password: "pass1234",
  passwordConfirm: "pass1234",
  role: "client",
};

beforeAll(async () => {
  const DB = process.env.TEST_DB!;
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
  const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN;
  const EMAIL_FROM = process.env.EMAIL_FROM;
  const EMAIL_PORT = process.env.EMAIL_PORT;
  const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
  const EMAIL_HOST = process.env.EMAIL_HOST;
  try {
    await mongoose.connect(DB);
    console.log("Connected to database for authentiaction tests");
  } catch (error) {
    console.error("Database connection error", error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  await Client.deleteOne({ email: user.email });
  console.log("Tested user deleted successfully");
  await mongoose.connection.close();
  console.log("Database connection closed ");
}, 30000);

describe("Sign up service", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/v1/users/signup")
      .send(user)
      .expect(201);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toMatch(/success/);
  });
});

describe("Login Service", () => {
  it("should login and authenticate a user", async () => {
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: user.email, password: user.password })
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toMatch(/success/);
    expect(res.body).toHaveProperty("token");
  });
});
