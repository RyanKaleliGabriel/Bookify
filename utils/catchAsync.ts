// The purpose of catchAsync here is to handle any asynchronous errors within deleteAppointment 
// and automatically pass them to the next error-handling middleware by calling next, simplifying
// error management and avoiding the need for multiple try-catch blocks.

import { NextFunction, Request, Response } from "express";

const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
