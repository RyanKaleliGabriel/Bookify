import express, { Express } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter";

//Error Controller
const globalErrorController = require("./controllers/errorController");

// Intialize application with express
const app = express();

//LOGGING WITH MORGAN IN DEVELOPMENT ENVIRONMENT
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Parses incoming cookies from client requests and makes them accessible in the req.cookies object
app.use(cookieParser());

//Body Parser, reads data from body into req.body
app.use(express.json());

// API ROUTES
app.use("/api/v1/users", userRouter);

// Global Error handling Middleware
app.use(globalErrorController);

export default app
