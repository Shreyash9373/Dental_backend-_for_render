import express from "express";

import { AsyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import {
  getPatient,
  addPatient,
  searchPatient,
  updatePatient,
} from "../controllers/patient.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const patientRoutes = express.Router();

// Prefix: /api/patients
patientRoutes.get(
  "/patient/:patientId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(getPatient)
);
patientRoutes.post(
  "/add-patient",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(addPatient)
);
patientRoutes.get(
  "/search-patient",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(searchPatient)
);
patientRoutes.put(
  "/:patientId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(updatePatient)
);

export default patientRoutes;
