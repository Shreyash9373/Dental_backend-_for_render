import express from "express";
import upload from "../config/multer.js";
import { addEvent, addBlogs } from "../controllers/doctorController.js";
import checkDoctor from "../middlewares/checkDoc.middleware.js";
import {
  addAccount,
  updateDoctor,
  changeReceptionistPassword,
  checkDoctorRefreshToken,
  doctorLogin,
  doctorLogout,
  doctorRegister,
  getDoctorDetails,
  getAllReceptionist,
  deleteReceptionist,
} from "../controllers/doctor.controller.js";
import { AsyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import { verifyDoctor } from "../middlewares/auth.middleware.js";

const doctorRouter = express.Router();

// Prefix: /api/doctors
doctorRouter.post("/login", AsyncErrorHandler(doctorLogin));
doctorRouter.post("/register", AsyncErrorHandler(doctorRegister));
doctorRouter.get(
  "/logout",
  AsyncErrorHandler(verifyDoctor),
  AsyncErrorHandler(doctorLogout)
);
doctorRouter.get("/check-refresh", AsyncErrorHandler(checkDoctorRefreshToken));
doctorRouter.get(
  "/details",
  AsyncErrorHandler(verifyDoctor),
  AsyncErrorHandler(getDoctorDetails)
);
doctorRouter.post(
  "/update",
  upload.single("image"),
  AsyncErrorHandler(verifyDoctor),
  AsyncErrorHandler(updateDoctor)
);
doctorRouter.post(
  "/add-member",
  AsyncErrorHandler(verifyDoctor),
  AsyncErrorHandler(addAccount)
);
doctorRouter.get(
  "/receptionists",
  AsyncErrorHandler(verifyDoctor),
  AsyncErrorHandler(getAllReceptionist)
);
doctorRouter.delete(
  "/receptionists",
  AsyncErrorHandler(verifyDoctor),
  AsyncErrorHandler(deleteReceptionist)
);
doctorRouter.post(
  "/change-receptionist-password",
  AsyncErrorHandler(verifyDoctor),
  AsyncErrorHandler(changeReceptionistPassword)
);

doctorRouter.post(
  "/add-event",
  upload.single("image"),
  AsyncErrorHandler(verifyDoctor),
  addEvent
);
doctorRouter.post(
  "/add-blog",
  upload.single("image"),
  AsyncErrorHandler(verifyDoctor),
  addBlogs
);

export default doctorRouter;
