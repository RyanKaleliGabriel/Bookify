import { NextFunction } from "express";
import Attendant, { AttendantDocument } from "../models/Attendant";
import AppError from "../utils/appError";
import Appointment from "../models/Appointment";

export const availability = async (
  attendant: AttendantDocument,
  date: string,
  next: NextFunction,
  start_time: string,
  end_time: string
) => {
  //Retrieve the attendant
  const bookingAttendant = await Attendant.findOne({
    _id: attendant,
  });

  const availability = bookingAttendant?.availability;
  if (!availability) {
    return next(new AppError("Attendant has not set a schedule", 404));
  }

  //check if the time and day falls in between the availability dates
  // Days of the week
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = new Date(date).getDay();
  const dayOfWeek = days[day];

  const dayAvailability = availability.filter(
    (avail: any) => avail.day_of_week === dayOfWeek
  );

  if (dayAvailability.length === 0) {
    return next(
      new AppError(`Attendant will not be available on ${dayOfWeek}`, 401)
    );
  }

  //Convert start abd ebd times to timestamps  for comparison
  const appointmentStart = new Date(`${date}, ${start_time}`).getTime(); 
  const appointmentEnd = new Date(`${date}, ${end_time}`).getTime(); //

  //Convert attenadnts's available start and end times to timestamps
  //7pm //8pm
  const isValidTime = dayAvailability.some((avail: any) => {
    const availabilityStart = new Date(
      `${date}, ${avail.start_time}`
    ).getTime();
    const availabilityEnd = new Date(`${date}, ${avail.end_time}`).getTime();
    console.log(appointmentStart, availabilityStart)
    console.log(appointmentEnd, availabilityEnd)

    return (
      appointmentStart >= availabilityStart && appointmentEnd <= availabilityEnd
    );
  });
  if (!isValidTime) {
    return next(
      new AppError(
        "Appointment time does not fit within this attendant's schedule ",
        401
      )
    );
  }
};

export const confilcting = async (
  attendant: AttendantDocument,
  date_new: any,
  end: any,
  start: any,
  next: NextFunction
) => {
  //Check for overlapping appointments for the same attendant on the same day
  const confilctingAppointment = await Appointment.findOne({
    attendant,
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
};

export const inputFormat = (
  end: any,
  start: any,
  next: NextFunction
): { hours: number; remainingMinutes: number } | void => {
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
  return { hours, remainingMinutes };
};
