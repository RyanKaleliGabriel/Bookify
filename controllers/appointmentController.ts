import { NextFunction, Request, Response } from "express";
import Appointment from "../models/Appointment";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import APIfeatures from "../utils/apiFeatures";

//CREATE AN APPOINTMENT
export const createAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const client = req.user.id;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    const date = req.body.date;

    const appointments = await Appointment.findOne({
      start_time,
      end_time,
      date,
    });

    if (appointments) {
      return new AppError("Time booked", 401);
    }

    const newAppointment = await Appointment.create({
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      date: req.body.date,
      reason: req.body.reason,
      attendant: req.body.attendant,
      client,
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

    // const similarAppoinment = await Appointment.findOne({
    //   start_time: appointment.start_time,
    //   end_time: appointment.end_time,
    //   date: appointment.date,
    // });

    if (similarAppoinment) {
      return next(new AppError("Time booked", 401));
    }

    // copnst updatedAppoinment = await Appointment.findByIdAndUpdate({

    // })

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
