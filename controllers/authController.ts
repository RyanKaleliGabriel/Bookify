import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Attendant from "../models/Attendant";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import Email from "../utils/email";
import crypto from "crypto";

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

// ROUTE PROTECTING MIDDLEWARE
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get token from Authorization Headers
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access", 401)
      );
    }

    //Token verification
    const verifyToken = (token: string, secret: string) =>
      new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err: any, decoded: any) => {
          if (err) return reject(err);
          resolve(decoded);
        });
      });
    const decoded: any = await verifyToken(token, process.env.JWT_SECRET!);

    //Check if user still exists. The user may be deleted
    const currentUser = await Attendant.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    //Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("Recently changed password! PLease login again", 401)
      );
    }

    //initialise req.user as the user
    req.user = currentUser;
    next();
  }
);

// UPDATE PASSWORD HANDLER
export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //Get user from collection
    const attendant = await Attendant.findById(req.user.id).select("+password");

    //Confirm if current(previous) password is correct

    if (req.body.passwordConfirm !== req.body.password) {
      return next(new AppError("Passwords do not match", 401));
    }

    if (
      !(await attendant!.correctPassword(
        req.body.passwordCurrent,
        attendant!.password
      ))
    ) {
      return next(new AppError("Current password is not correct", 401));
    } else if (
      await attendant!.correctPassword(req.body.password, attendant!.password)
    ) {
      return next(
        new AppError(
          "Previous passwords cannot be the same with your new password.",
          401
        )
      );
    }

    //Update password
    attendant!.password = req.body.password;
    console.log(attendant!.password);
    attendant!.passwordConfirm = req.body.passwordConfirm;
    await attendant!.save();

    //send jwt token
    createSendToken(attendant, 201, res, req);
  }
);

//Forgot password Handler
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //get the user based on the email posted
    const attendant = await Attendant.findOne({ email: req.body.email }).select(
      "+password"
    );

    if (!attendant) {
      return next(new AppError("There is no user with that email", 401));
    }

    // If the user exists create a resetToken
    const resetToken = attendant.createPasswordResetToken();
    await attendant.save({ validateBeforeSave: false });

    ///Send the token as an email
    try {
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/resetPassword/${resetToken}`;
      await new Email(attendant, resetURL).sendPasswordReset();
      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (err) {
      attendant.passwordResetToken = "";
      attendant.passwordResetExpires = "";
      await attendant.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  }
);

// Reset Password handler
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const attendant = await Attendant.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    //Set Password if token has not expired
    if (!attendant) {
      return next(new AppError("Token is invalid or has expired", 401));
    }

    attendant!.password = req.body.password;
    attendant!.passwordConfirm = req.body.passwordConfirm;
    attendant.passwordResetExpires = "";
    attendant.passwordResetToken = "";

    await attendant.save();
    //Send New Jwt Token
    createSendToken(attendant, 200, res, req);
  }
);
