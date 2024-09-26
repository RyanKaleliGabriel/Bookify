import { NextFunction, Request, Response } from "express";
import Attendant from "../models/Attendant";
import Client from "../models/Client";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import { timeValidity } from "../validators/appointment";

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find user based on ID
    const attendant = await Attendant.findById(req.user.id);
    const client = await Client.findById(req.user.id);
    // Determine user role
    const user = client ? client : attendant;

    //Check if user exists
    if (!user) {
      return next(new AppError("No document found with that id", 404));
    }

    //Return response
    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  }
);

// Update Handler
export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const attendant = await Attendant.findById(req.user.id);
    const client = await Client.findById(req.user.id);
    let user = client || attendant;
    if (!user) {
      return next(new AppError("No doc with that id exists", 404));
    }

    if (req.body.availability) {
      const isValidTime = timeValidity(req.body.availability);

      if (!isValidTime) {
        return next(new AppError("Invalid start and end time", 401));
      }
      user = await Attendant.findByIdAndUpdate(attendant?.id, req.body, {
        runValidators: true,
        new: true,
      });
    } else if (client) {
      user = await Client.findByIdAndUpdate(client!.id, req.body, {
        runValidators: true,
        new: true,
      });
    } else {
      user = await Attendant.findByIdAndUpdate(attendant?.id, req.body, {
        runValidators: true,
        new: true,
      });
    }

    res.status(201).json({
      status: "success",
      data: {
        data: user,
      },
    });
  }
);

// Delete Handler
export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const attendant = await Attendant.findByIdAndDelete(req.user.id);
    const client = await Client.findByIdAndDelete(req.user.id);
    const user = client ? client : attendant;

    if (!user) {
      return next(new AppError("No document with that id exists", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find user based on ID
    const attendant = await Attendant.findById(req.params.id);
    const client = await Client.findById(req.params.id);
    // Determine user role
    const user = client || attendant;

    //Check if user exists
    if (!user) {
      return next(new AppError("No document found with that id", 404));
    }

    //Return response
    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  }
);
