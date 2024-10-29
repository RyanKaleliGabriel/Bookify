import { NextFunction, Request, Response } from "express";
import Appointment from "../models/Appointment";
import APIfeatures from "../utils/apiFeatures";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  availability,
  confilcting,
  confilctingUpdate,
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

    const { hours, remainingMinutes, errorsInput } = inputFormat(end, start);
    if (errorsInput.length > 0 && errorsInput) {
      return next(new AppError(errorsInput[0].message, errorsInput[0].code));
    }

    const errorsAvail = await availability(
      attendant,
      date,
      start_time,
      end_time
    );

    if (errorsAvail.length > 0 && errorsAvail) {
      return next(new AppError(errorsAvail[0].message, errorsAvail[0].code));
    }
    const errorsConflict = await confilcting(attendant, date_new, end, start);
    if (errorsConflict.length > 0 && errorsConflict) {
      return next(
        new AppError(errorsConflict[0].message, errorsConflict[0].code)
      );
    }

    const newAppointment = await Appointment.create({
      start_time,
      end_time,
      startms: start,
      endms: end,
      date: date_new,
      reason,
      attendant,
      client,
      hours,
      minutes: remainingMinutes,
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
      const attendant = req.body.attendant;

      const result = inputFormat(end, start);
      if (result) {
        req.body.hours = result.hours;
        req.body.minutes = result.remainingMinutes;
      }
      if (result.errorsInput.length > 0 && result.errorsInput) {
        const errors = result.errorsInput;
        return next(new AppError(errors[0].message, errors[0].code));
      }

      const errorsAvail = await availability(
        attendant,
        req.body.date,
        req.body.start_time,
        req.body.end_time
      );

      if (errorsAvail.length > 0 && errorsAvail) {
        return next(new AppError(errorsAvail[0].message, errorsAvail[0].code));
      }

      const errorsConflict = await confilctingUpdate(
        attendant,
        date_new,
        end,
        start,
        req.params.id
      );
      if (errorsConflict.length > 0 && errorsConflict) {
        return next(
          new AppError(errorsConflict[0].message, errorsConflict[0].code)
        );
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );

    return res.status(201).json({
      status: "success",
      data: {
        data: updatedAppointment,
      },
    });
  }
);

// DELETE AN APPOINTMENT
export const deleteAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return next(new AppError("No document with that id was found", 404));
    }

    return res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
