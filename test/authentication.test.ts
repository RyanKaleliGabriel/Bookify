import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import dotenv from "dotenv";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Client, { ClientDocument } from "../models/Client";

dotenv.config({ path: "../config.env" });

let user = {
  name: "Demo user",
  email: "demo@gmail.com",
  password: "pass1234",
  passwordConfirm: "pass1234",
  role: "client",
};

beforeAll(async () => {
  const DB = process.env.DATABASE!.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD!
  );

  try {
    await mongoose.connect(DB);
    console.log("Connected to database for authentiaction tests");
  } catch (error) {
    console.error("Database connection error", error);
    throw error;
  }
});

afterAll(async () => {
  await Client.deleteOne({ email: user.email });
  console.log("Tested user deleted successfully");
  await mongoose.connection.close();
  console.log("Database connection closed ");
});

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

    console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toMatch(/success/);
    expect(res.body).toHaveProperty("token");
  });
});