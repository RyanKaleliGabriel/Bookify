import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Attendant from "../models/Attendant";
import Client from "../models/Client";
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
    // secure: req.secure || req.header("x-forwaded-proto") === "https",
    secure:false
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
    const { role, name, email, password, passwordConfirm } = req.body;
    const newUser =
      role === "attendant"
        ? await Attendant.create({
            name,
            email,
            password,
            passwordConfirm,
            role,
          })
        : await Client.create({
            name,
            email,
            password,
            passwordConfirm,
            role,
          });
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res, req);
  }
);

//Login handler
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Destructure the email and password from the payload
    const { email, password } = req.body;

    // Check if the inputs are present
    if (!email || !password) {
      return next(new AppError("Provide email and password!", 400));
    }
    //query the user using the email input
    const attendant = await Attendant.findOne({ email })
      .select("+password")
      .select("+role");
    const client = await Client.findOne({ email })
      .select("+password")
      .select("+role");
    const user = attendant ? attendant : client;

    //Check if user exists from the query if password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    //If everything is correct send jwt Token
    createSendToken(user, 200, res, req);
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
    const currentAttendant = await Attendant.findById(decoded.id);
    const currentClient = await Client.findById(decoded.id);
    const currentUser = currentAttendant ? currentAttendant : currentClient;

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    //Check if user changed password after token was issued
    if (currentUser!.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("Recently changed password! PLease login again", 401)
      );
    }

    //initialise req.user as the user
    req.user = currentUser;
    next();
  }
);

// Restricting middl

export const restrictTo = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (role !== req.user.role) {
      return next(new AppError("Request restricted to authoroized users", 403));
    }
    next();
  };
};

// UPDATE PASSWORD HANDLER
export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //Get user from collection

    const attendant = await Attendant.findById(req.user.id).select("+password");
    const client = await Client.findById(req.user.id).select("+password");
    const user = attendant ? attendant : client;

    //Confirm if current(previous) password is correct
    if (req.body.passwordConfirm !== req.body.password) {
      return next(new AppError("Passwords do not match", 401));
    }

    if (
      !(await user!.correctPassword(req.body.passwordCurrent, user!.password))
    ) {
      return next(new AppError("Current password is not correct", 401));
    } else if (await user!.correctPassword(req.body.password, user!.password)) {
      return next(
        new AppError(
          "Previous passwords cannot be the same with your new password.",
          401
        )
      );
    }

    //Update password
    user!.password = req.body.password;
    user!.passwordConfirm = req.body.passwordConfirm;
    await user!.save();

    //send jwt token
    createSendToken(user, 201, res, req);
  }
);

//Forgot password Handler
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //get the user based on the email posted
    const attendant = await Attendant.findOne({ email: req.body.email }).select(
      "+password"
    );
    const client = await Client.findOne({ email: req.body.email }).select(
      "+password"
    );
    const user = client ? client : attendant;

    if (!user) {
      return next(new AppError("There is no user with that email", 401));
    }

    // If the user exists create a resetToken
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    ///Send the token as an email
    try {
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(user, resetURL).sendPasswordReset();
      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (err) {
      user.passwordResetToken = "";
      user.passwordResetExpires = "";
      await user.save({ validateBeforeSave: false });
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
    const client = await Client.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    const user = attendant ? attendant : client;

    //Set Password if token has not expired
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 401));
    }

    user!.password = req.body.password;
    user!.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = "";
    user.passwordResetToken = "";

    await user.save();
    //Send New Jwt Token
    createSendToken(user, 200, res, req);
  }
);
