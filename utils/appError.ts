interface AppError {
  status: string;
  statusCode: number;
  isOperational: boolean;
}

class AppError extends Error {
  constructor(message: string, statusCode: number) {
    //  invokes the constructor of the parent Error class, 
    // allowing the AppError instance to inherit properties 
    // from Error, such as the message property

    // When you call super(message) in the constructor of AppError, 
    // it invokes the constructor of the parent Error class and passes the message argument to it.
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "Error";
    this.isOperational = true;
    //  creates a stack trace for the error, excluding the constructor 
    // call from the stack, which helps in identifying the point in the 
    // code where the error occurred without cluttering the stack trace 
    // with the error class instantiation.
    Error.captureStackTrace(this, this.constructor);
    // the stack is inherited from the Error class, and calling super(message) 
    // initializes the message property while Error.captureStackTrace captures 
    // the stack trace at the point of the error's instantiation.

  }
}

export default AppError ;
