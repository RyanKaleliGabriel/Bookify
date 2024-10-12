import dotenv from "dotenv";
import mongoose from "mongoose";
// SuperTest: Using Supertest, we can test endpoints and routes on HTTP servers.
import request from "supertest";
import app from "../app";
import { AppointmentDocument } from "../models/Appointment";

import { afterAll, beforeAll, describe, expect, it, jest, } from "@jest/globals";
dotenv.config({ path: "../config.env" });

const TIME_IN_SECONDS = 8 * 1000;
jest.setTimeout(TIME_IN_SECONDS);
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDY1MWVkYjU1NjJmMmJlNzk3NjUxZCIsImlhdCI6MTcyODY1OTg3NSwiZXhwIjoxNzM2NDM1ODc1fQ.KK0uehiU_nxcrTfg-pmcBRkPUiG2jLdlzCFcIMS3u0g";
let appointment: AppointmentDocument;

const newAppointment = {
  attendant: "670653a7b5562f2be79765d5",
  start_time: "10:00 AM",
  end_time: "10:15 AM",
  date: "11/18/2024",
  reason: "Demo Reason",
};

const updateValidData = {
  start_time: "10:16 AM",
  end_time: "10:45 AM",
  date: "11/18/2024",
  reason: "Demo reason 5",
  attendant: "670653a7b5562f2be79765d5",
};

//Connect to the database before running any test
//When running tests that interact with a database,
// it's crucial to manage the connection lifecycle to prevent Jest from hanging due to open connections.

beforeAll(async () => {
  const DB = process.env.DATABASE!.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD!
  );
  try {
    await mongoose.connect(DB);
    console.log("Connected to the database for appointment service testing");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log("Disconnected from the database after testing. ");
});

describe("POST /api/v1/appointments,", () => {
  it("should return all appointments", async () => {
    const response = await request(app)
      .post("/api/v1/appointments/createAppointment")
      .set("Authorization", `Bearer, ${token}`)
      .expect("Content-Type", /json/)
      .send(newAppointment)
      .expect(201);
    appointment = response.body.data.data;
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toMatch(/success/);
  });
});

describe("GET /api/v1/appointments/", () => {
  it("should return all appointments", async () => {
    const response = await request(app)
      .get("/api/v1/appointments/getAppointments")
      .set("Authorization", `Bearer, ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toMatch(/success/);
  });
});

describe("GET /api/v1/appointments/getAppointment/:id", () => {
  it("should return an appointment", async () => {
    const response = await request(app)
      .get(`/api/v1/appointments/getAppointments/${appointment._id}`)
      .set("Authorization", `Bearer, ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toMatch(/success/);
  });
});

describe("PATCH, /api/v1/appointments", () => {
  it("should update an appointment", async () => {
    const response = await request(app)
      .patch(`/api/v1/appointments/updateAppointment/${appointment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateValidData)
      .expect(201);

    expect(response.statusCode).toBe(201);
    expect(response.body.status).toMatch(/success/);
  });
});

describe("DELETE, /api/v1/appointments", () => {
  it("should delete an appointment", async () => {
    const response = await request(app)
      .delete(`/api/v1/appointments/deleteAppointment/${appointment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(response.statusCode).toBe(204);
  });
});
