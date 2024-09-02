import mongoose, { Schema, Document, model } from "mongoose";
import Client from "./Client";
import Attendant from "./Attendant";
import AppError from "../utils/appError";
import { getAppointment } from "../controllers/appointmentController";

export interface AppointmentDocument extends Document {
  start_time: number;
  end_time: number;
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
    type: Number,
    required: [true, "Start time is required"],
  },
  end_time: {
    type: Number,
    required: [true, "End time is required"],
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
    enum: ["approved", "rejected", "postponed", "on-going", "pending"],
    required: [true, "Appointment status is required"],
    default: "pending",
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

// appointmentSchema.methods.duration = function (
//   date: string,
//   start_time: string,
//   end_time: string
// ) {
//   const start = new Date(`${date}, ${start_time}`);
//   const end = new Date(`${date}, ${end_time}`);

//   // Calculate the difference in milliseconds
//   const diff = end.getTime() - start.getTime();

//   //Convert milliseconds to minutes
//   const minutes = Math.floor(diff / 1000 / 60);

//   //Convert to hours and minutes
//   const hours = Math.floor(minutes / 60);
//   const remainingMinutes = minutes % 60;

//   if (remainingMinutes < 1 && hours < 1) {
//     next(new AppError("Invalid start and end time", 401));
//   }

//   return { hours, remainingMinutes };
// };

// appointmentSchema.pre("save", async function (next) {
//   // Parse the start and end time as Date objects
//   const start = new Date(`${this.date}, ${this.start_time}`);
//   const end = new Date(`${this.date}, ${this.end_time}`);

//   // Calculate the difference in milliseconds
//   const diff = end.getTime() - start.getTime();

//   //Convert milliseconds to minutes
//   const minutes = Math.floor(diff / 1000 / 60);

//   //Convert to hours and minutes
//   const hours = Math.floor(minutes / 60);
//   const remainingMinutes = minutes % 60;

//   if (remainingMinutes < 0 && hours < 0) {
//     next(new AppError("Invalid start and end time", 401));
//   }

//   this.hours = hours;
//   this.minutes = remainingMinutes;
//   next();
// });

// Pre-update middleware (for findOneAndUpdate)
appointmentSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as Record<string, any>;

  // Only calculate if `start_time` or `end_time` are part of the update
  const startTime = update.start_time;
  const endTime = update.end_time;
  const date = update.date;

  if (startTime && endTime && date) {
    const start = new Date(`${date}, ${startTime}`);
    const end = new Date(`${date}, ${endTime}`);

    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes < 1 && hours < 1) {
      return next(new AppError("Invalid start and end time", 401));
    }

    // Set hours and minutes in the update query
    update.hours = hours;
    update.minutes = remainingMinutes;
    this.setUpdate(update);
  }

  next();
});

const Appointment = model<AppointmentDocument>(
  "Appointment",
  appointmentSchema
);
export default Appointment;
