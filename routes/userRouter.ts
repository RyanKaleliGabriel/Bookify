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
import {
  deleteMe,
  getMe,
  getUser,
  getUserById,
  updateMe,
} from "../controllers/userController";

//Initialise express router
const router = express.Router();

//Authentication routes

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect);
router.patch("/updatePassword", updatePassword);
router.get("/getUser/:email", getUser);
router.get("/getUserById/:id", getUserById);

router.get("/getMe", getMe);
router.delete("/deleteMe", deleteMe);
router.patch("/updateMe", updateMe);

export default router;
