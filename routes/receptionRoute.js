import express from "express";
import {
  bookAppointment,
  getPatient,
  getEnquiry,
  updatePatient,
  getAvailableSlots,
} from "../controllers/receptionController.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import checkReception from "../middlewares/checkRecep.middleware.js";
const receptionRouter = express.Router();

receptionRouter.post("/book-appointment",checkReception , bookAppointment);
receptionRouter.post("/get-patient",verifyJwt, getPatient);
receptionRouter.get("/get-Enquiry",checkReception , getEnquiry);
receptionRouter.put("/update-patient", checkReception , updatePatient);
receptionRouter.get("/available-slots" , getAvailableSlots);


export default receptionRouter;
