import { NextFunction, Request, Response } from "express";
import Appointment from "../models/Appointment";
import Attendant from "../models/Attendant";
import APIfeatures from "../utils/apiFeatures";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

//CREATE AN APPOINTMENT
export const createAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attendant, start_time, end_time, date, reason } = req.body;
    const client = req.user.id;

    const start = new Date(`${date}, ${start_time}`).getTime();
    const end = new Date(`${date}, ${end_time}`).getTime();
    const date_new = new Date(`${date}`).toDateString();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = new Date(`${date}`).getDay();

    //Retrieve the attendant
    const bookingAttendant = await Attendant.findOne({
      _id: attendant,
    });

    //check if the time and day falls in between the availability dates

    // Day
    const availability = bookingAttendant?.availability;
    // if (!availability) {
    //   return next(new AppError("Attendant has not set a schedule", 404));
    // }
    // const appointment_days = availability.map(
    //   (avail: any) => avail.day_of_week
    // );
    // if (!appointment_days.includes(day)) {
    //   return next(new AppError("Attendent will not be free", 401));
    // }

    // Time
    const start_before = new Date(`1970/01/01, ${start_time}`).getTime();
    const end_after = new Date(`1970/01/01, ${end_time}`).getTime();
    const appointmentStartTime = availability.map((avail: any) =>
      new Date(`1970/01/01, ${avail.start_time}`).getTime()
    );

    const appointmentEndTime = availability.map((avail: any) =>
      new Date(`1970/01/01, ${avail.end_time}`).getTime()
    );

    const bookedBefore = appointmentStartTime.filter(
      (time: any) => time < start_before
    );
    if (bookedBefore && bookedBefore.length > 0) {
      return new AppError("Meeting time has not started", 401);
    }

    const bookedAfter = appointmentEndTime.filter(
      (time: any) => time < end_after
    );
    if (bookedAfter && bookedAfter.length > 0) {
      return next(new AppError("Meeting time will have ended", 401));
    }

    // // Calculate the difference in milliseconds
    // const diff = end - start;

    // //Convert milliseconds to minutes
    // const minutes = Math.floor(diff / 1000 / 60);

    // //Convert to hours and minutes
    // const hours = Math.floor(minutes / 60);
    // const remainingMinutes = minutes % 60;

    // if (remainingMinutes < 0 && hours < 0) {
    //   next(new AppError("Invalid start and end time", 401));
    // }

    // if (end <= start) {
    //   return next(new AppError("Invalid date or time", 401));
    // }

    // //Check for overlapping appointments for the same attendant on the same day
    // const confilctingAppointment = await Appointment.findOne({
    //   attendant,
    //   date: date_new,
    //   $or: [
    //     { start_time: { $lt: end, $gte: start } }, // Starts within the new appointment time
    //     { end_time: { $gt: start, $lte: end } }, // Ends within the new appointment time
    //     {
    //       start_time: { $lte: start },
    //       end_time: { $gte: end },
    //     }, // Encloses the new appointment
    //   ],
    // });

    // if (confilctingAppointment) {
    //   console.log(confilctingAppointment);
    //   return next(new AppError("Time slot is already booked", 401));
    // }

    // const newAppointment = await Appointment.create({
    //   start_time: start,
    //   end_time: end,
    //   date: date_new,
    //   reason,
    //   attendant,
    //   client,
    //   hours,
    //   minutes,
    // });

    // return res.status(201).json({
    //   status: "success",
    //   data: {
    //     data: newAppointment,
    //   },
    // });
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

      // Calculate the difference in milliseconds
      const diff = end - start;

      //Convert milliseconds to minutes
      const minutes = Math.floor(diff / 1000 / 60);

      //Convert to hours and minutes
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (remainingMinutes < 0 && hours < 0) {
        next(new AppError("Invalid start and end time", 401));
      }

      if (end <= start) {
        return next(new AppError("Invalid date or time", 401));
      }

      //Check for overlapping appointments for the same attendant on the same day
      const confilctingAppointment = await Appointment.findOne({
        attendant: req.body.attendant,
        date: date_new,
        $or: [
          { start_time: { $lt: end, $gte: start } }, // Starts within the new appointment time
          { end_time: { $gt: start, $lte: end } }, // Ends within the new appointment time
          {
            start_time: { $lte: start },
            end_time: { $gte: end },
          }, // Encloses the new appointment
        ],
      });

      if (confilctingAppointment) {
        console.log(confilctingAppointment);
        return next(new AppError("Time slot is already booked", 401));
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
