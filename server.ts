import dotenv from 'dotenv'
import mongoose from 'mongoose'; 
import app from './app';
//Configure Environment variables
dotenv.config({ path: "./config.env" });

// Initialize database
if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  throw new Error("Database environment variables not defined");
}

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
