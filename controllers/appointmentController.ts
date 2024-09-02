import { NextFunction, Request, Response } from "express";
import Appointment from "../models/Appointment";
import APIfeatures from "../utils/apiFeatures";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  availability,
  confilcting,
  inputFormat,
} from "../validators/appointment";

//CREATE AN APPOINTMENT
export const createAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attendant, start_time, end_time, date, reason } = req.body;
    const client = req.user.id;

    const start = new Date(`${date}, ${start_time}`).getTime();
    const end = new Date(`${date}, ${end_time}`).getTime();
    const date_new = new Date(`${date}`).toDateString();

    const result = inputFormat(end, start, next);
    let hours: number | undefined;
    let minutes: number | undefined;
    if (result) {
      hours = result.hours;
      minutes = result.remainingMinutes;
    }
    await availability(attendant, date, next, start_time, end_time);
    await confilcting(attendant, date_new, end, start, next);

    const newAppointment = await Appointment.create({
      start_time,
      end_time,
      date: date_new,
      reason,
      attendant,
      client,
      hours,
      minutes,
    });

    return res.status(201).json({
      status: "success",
      data: {
        data: newAppointment,
      },
    });
  }
);

// GET AN APPOINTMENT
export const getAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new AppError("No document found with that id", 404));
    }

    return res.status(200).json({
      status: "success",
      data: {
        data: appointment,
      },
    });
    next();
  }
);

// GET ALL APPOINTMENTS
export const getAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIfeatures(Appointment.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    return res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  }
);

// UPDATE AN APPOINTMENT
export const updateAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new AppError("No document with that id was found", 404));
    }

    if (
      req.body.start_time ||
      req.body.end_time ||
      req.body.date ||
      req.body.attendant
    ) {
      const start = new Date(
        `${req.body.date}, ${req.body.start_time}`
      ).getTime();
      const end = new Date(`${req.body.date}, ${req.body.end_time}`).getTime();
      const date_new = new Date(`${req.body.date}`).toDateString();
      const attendant = req.body.attendant

      const result = inputFormat(end, start, next);
      if (result) {
        req.body.hours = result.hours;
        req.body.minutes = result.remainingMinutes;
      }
      await availability(attendant, req.body.date, next, req.body.start_time, req.body.end_time);
      await confilcting(attendant, date_new, end, start, next);

    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );

    return res.status(200).json({
      status: "success",
      data: {
        data: updatedAppointment,
      },
    });
  }
);

// DELETE AN APPOINTMENT
export const deleteAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) {
    return next(new AppError("No document with that id was found", 404));
  }

  return res.status(204).json({
    status: "success",
    data: null,
  });
};
