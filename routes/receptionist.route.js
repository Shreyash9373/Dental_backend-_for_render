import express from "express";
// import {
//   bookAppointment,
//   getPatient,
//   getEnquiry,
//   updatePatient,
//   getAvailableSlots,
// } from "../controllers/receptionController.js";
import {
  verifyJwt,
  verifyReceptionist,
} from "../middlewares/auth.middleware.js";
// import checkReception from "../middlewares/checkRecep.middleware.js";
import {
  receptionistLogin,
  receptionistLogout,
  checkReceptionistRefreshToken,
  bookAppointment,
  getAppointment,
  getEnquiry,
  updateAppointment,
  getAvailableSlots,
} from "../controllers/receptionist.controller.js";
import { AsyncErrorHandler } from "../utils/AsyncErrorHandler.js";
const receptionistRoutes = express.Router();

// Prefix: /api/receptionists
receptionistRoutes.post("/login", AsyncErrorHandler(receptionistLogin));
receptionistRoutes.get(
  "/logout",
  AsyncErrorHandler(verifyReceptionist),
  AsyncErrorHandler(receptionistLogout)
);
receptionistRoutes.get(
  "/check-refresh",
  AsyncErrorHandler(checkReceptionistRefreshToken)
);

receptionistRoutes.post(
  "/book-appointment",
  AsyncErrorHandler(verifyReceptionist),
  AsyncErrorHandler(bookAppointment)
);
receptionistRoutes.post(
  "/get-appointment",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(getAppointment)
);
receptionistRoutes.get(
  "/get-enquiry",
  AsyncErrorHandler(verifyReceptionist),
  AsyncErrorHandler(getEnquiry)
);
receptionistRoutes.put(
  "/update-appointment",
  AsyncErrorHandler(verifyReceptionist),
  AsyncErrorHandler(updateAppointment)
);
receptionistRoutes.get(
  "/available-slots",
  AsyncErrorHandler(getAvailableSlots)
);

export default receptionistRoutes;
