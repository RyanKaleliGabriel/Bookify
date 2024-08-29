import { NextFunction, Request, Response } from "express";
import Attendant from "../models/Attendant";
import Client from "../models/Client";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

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
    const attendant = await Attendant.findByIdAndUpdate(req.user.id, req.body, {
      runValidators: true,
      new: true,
    });

    const client = await Client.findByIdAndUpdate(req.user, req.body, {
      runValidators: true,
      new: true,
    });

    const user = client ? client : attendant;

    if (!user) {
      return next(new AppError("No doc with that id exists", 404));
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
