import mongoose, { Schema, Document, model } from "mongoose";
import Client from "./Client";
import Attendant from "./Attendant";

export interface AppointmentDocument extends Document {
  start_time: string;
  end_time: string;
  startms: number;
  endms: number;
  date: string;
  hours: number;
  minutes: number;
  reason: string;
  status: string;
  created_at: object;
  active: boolean;
  attendant: any;
  client: any;
}

const appointmentSchema = new Schema<AppointmentDocument>({
  start_time: {
    type: String,
    required: [true, "Start time is required"],
  },
  end_time: {
    type: String,
    required: [true, "End time is required"],
  },
  startms: {
    type: Number,
    required: [true, "Start time is required"],
    select: false,
  },
  endms: {
    type: Number,
    required: [true, "End time is required"],
    select: false,
  },
  date: {
    type: String,
    required: [true, "Date is required"],
  },
  hours: {
    type: Number,
  },
  minutes: {
    type: Number,
  },
  reason: {
    type: String,
    required: [true, "Appointment reason is required"],
  },
  status: {
    type: String,
    enum: ["Approved", "Declined", "Pending"],
    required: [true, "Appointment status is required"],
    default: "Pending",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
  },
  attendant: {
    type: mongoose.Schema.ObjectId,
    ref: "Attendant",
    required: [true, "An appointment must have an attendant"],
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: "Client",
    required: [true, "An appointment must have a client"],
  },
});

const Appointment = model<AppointmentDocument>(
  "Appointment",
  appointmentSchema
);
export default Appointment;
