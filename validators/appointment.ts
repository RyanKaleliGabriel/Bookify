
import Appointment from "../models/Appointment";
import Attendant, { AttendantDocument } from "../models/Attendant";

type Error = {
  message: string;
  code: number;
};

export const availability = async (
  attendant: AttendantDocument,
  date: string,
  start_time: string,
  end_time: string
) => {
  const errorsAvail: { message: string; code: number }[] = [];
  //Retrieve the attendant
  const bookingAttendant = await Attendant.findOne({
    _id: attendant,
  });

  const availability = bookingAttendant?.availability;
  if (availability.length === 0) {
    errorsAvail.push({
      message: "Attendant has not set a schedule",
      code: 404,
    });
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
    errorsAvail.push({
      message: `Attendant will not be available on ${dayOfWeek}`,
      code: 401,
    });
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
    return (
      appointmentStart >= availabilityStart && appointmentEnd <= availabilityEnd
    );
  });
  if (!isValidTime) {
    errorsAvail.push({
      message:
        "Appointment time does not fit within this attendant's schedule ",
      code: 401,
    });
  }

  return errorsAvail;
};

export const confilcting = async (
  attendant: AttendantDocument,
  date_new: any,
  end: any,
  start: any,

) => {
  const errorsConflict: { message: string; code: number }[] = [];
  //Check for overlapping appointments for the same attendant on the same day
  const confilctingAppointment = await Appointment.findOne({
    attendant,
    date: date_new,
    $or: [
      { startms: { $lt: end, $gte: start } }, // Starts within the new appointment time
      { endms: { $gt: start, $lte: end } }, // Ends within the new appointment time
      {
        startms: { $lte: start },
        endms: { $gte: end },
      }, // Encloses the new appointment
    ],
  }).select('+startms +endms');

  if (confilctingAppointment) {
    errorsConflict.push({
      message: "Time slot is already booked",
      code: 401,
    });
  }

  return errorsConflict;
};

export const inputFormat = (
  end: any,
  start: any,

): { hours: number; remainingMinutes: number; errorsInput: Error[] } => {
  const errorsInput: Error[] = [];
  // Calculate the difference in milliseconds
  const diff = end - start;

  //Convert milliseconds to minutes
  const minutes = Math.floor(diff / 1000 / 60);

  //Convert to hours and minutes
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (end <= start) {
    errorsInput.push({
      message: "Invalid date or time",
      code: 401,
    });
  }

  //Check if time is past today
  const today = new Date().getTime();
  if (start < today) {
    errorsInput.push({
      message: "Appointments are only made past the current date and time",
      code: 401,
    });
  }

  return { hours, remainingMinutes, errorsInput };
};

export const timeValidity = (availability: any) => {
  const availNumber = availability.length;
  const validAvailability = availability.filter((avail: any) => {
    const start = new Date(`1970-01-01, ${avail.start_time}`).getTime();
    const end = new Date(`1970-01-01, ${avail.end_time}`).getTime();
    return start < end;
  });

  return validAvailability.length === availNumber;
};
