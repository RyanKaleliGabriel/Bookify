import express from "express";
import { login, logout, signup } from "../controllers/authController";

//Initialise express router
const router = express.Router();

//Authentication routes

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;
