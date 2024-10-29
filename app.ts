import express, { NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter";
import appointmentRouter from "./routes/appointmentRouter";
import pug from "pug";
import path from "path";
import dotenv from "dotenv";
import AppError from "./utils/appError";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

dotenv.config({ path: "./config.env" });

//Error Controller
const globalErrorController = require("./controllers/errorController");

// Intialize application with express
const app = express();

// For secure cookie options
// app.enable("trust proxy");

//Email templating
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Reducing Finger printing.
// By default express sends the X-powered-By response header that you can disable using the app.disable() method.
app.disable("x-powered-by");

//Enable cors for all origins
app.use(
  cors({
    credentials: true,
  })
);

// Cors for non-simple requests(put, patch, delete or request that send cookies or use non standard headers),
// The browser does an option request to see if the request is safe,
// When we get the options request we send back to the browser cors() to tell it the nonsimple request
// is safe to perform
app.options("*", cors());

//Prevent XSS Attatcks by setting special headers
app.use(helmet({ contentSecurityPolicy: false }));

//LOGGING WITH MORGAN IN DEVELOPMENT ENVIRONMENT
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//limit requests from the same api
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP please try again in an hour!",
});
app.use(limiter);

// Limiting the body payload
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
//Parses incoming cookies from client requests and makes them accessible in the req.cookies object
app.use(cookieParser());

// Data sanitization against NO-SQL injections
app.use(mongoSanitize());

//Body Parser, reads data from body into req.body
app.use(express.json());

//Performance middleware - Compress texts sent to clients
app.use(compression());

// API ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/appointments/", appointmentRouter);

//Error handling for wrong routes
app.all("*", (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  );
});

// Global Error handling Middleware
app.use(globalErrorController);

export default app;
