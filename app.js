const express = require("express");
const morgan = require("morgan");

// Intialize application with express
const app = express();


//LOGGING WITH MORGAN IN DEVELOPMENT ENVIRONMENT
if ((process.env.NODE_ENV = "development")) {
  app.use(morgan("dev"));
}


module.exports = app