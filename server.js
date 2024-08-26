const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

//Configure Environment variables
dotenv.config({ path: "./config.env" });

// Initialize database
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Configure Mongodb database with mongoose ODM
mongoose.connect(DB).then(() => console.log("DB connected successfully"));

//Set up server port
const port = process.env.PORT || 3000;

//Set up server application
const server = app.listen(port, () => {
  console.log(`App running on ${process.env.NODE_ENV} environment`);
  console.log(`App Listening on port ${port}`);
});
