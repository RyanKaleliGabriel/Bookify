import express from "express";
import {
  forgotPassword,
  login,
  logout,
  protect,
  resetPassword,
  signup,
  updatePassword,
} from "../controllers/authController";

//Initialise express router
const router = express.Router();

//Authentication routes

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

router.use(protect);
router.patch("/updatePassword", updatePassword);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword)

export default router;
