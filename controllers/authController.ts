import Attendant from "../models/Attendant";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";

// Generate a signed jwt token with the user's id.
const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// HTTP ONLY IS FOR PREVENTING THE COOKIE FROM BEING MODIFIED BY THE BROWSER
const createSendToken = (
  user: any,
  statusCode: number,
  res: Response,
  req: Request
) => {
  const token = signToken(user._id);
  user.password = undefined;

  // Send token to browser in a cookie form
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 100
    ),
    httpOnly: true,
    secure: req.secure || req.header("x-forwaded-proto") === "https",
  });

  //Return response
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//Sign up handler
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const newAttendant = await Attendant.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newAttendant, 201, res, req);
  }
);

//Login handler
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    // Destructure the email and password from the payload
    const { email, password } = req.body;

    // Check if the inputs are present
    if (!email || !password) {
      return next(new AppError("Provide email and password!", 400));
    }
    //query the user using the email input
    const attendant = await Attendant.findOne({ email }).select("+password");

    //Check if user exists from the query if password is correct
    if (
      !attendant ||
      !(await attendant.correctPassword(password, attendant.password))
    ) {
      return next(new AppError("Invalid email or password", 401));
    }

    //If everything is correct send jwt Token
    createSendToken(attendant, 200, res, req);
  }
);

//Logout Handler
export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};
