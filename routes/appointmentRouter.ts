import express from "express";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  updateAppointment,
} from "../controllers/appointmentController";
import { protect, restrictTo } from "../controllers/authController";

const router = express.Router();

router.use(protect);

router.get("/getAppointments", getAppointments);
router.get("/getAppointments/:id", getAppointment);
router.post("/createAppointment", restrictTo("client"), createAppointment);
router.patch("/updateAppointment/:id", updateAppointment);
router.delete("/deleteAppointment/:id", deleteAppointment);

export default router;
