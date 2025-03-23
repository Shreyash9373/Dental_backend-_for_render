import express from "express";
import {
  login,
  register,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  addMember,
} from "../controllers/dashboardController.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { AsyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import checkDoctor from "../middlewares/checkDoc.middleware.js";

const dashboardRouter = express.Router();

dashboardRouter.post("/login", AsyncErrorHandler(login)); // Corrected the router name
dashboardRouter.post("/register", AsyncErrorHandler(register));
dashboardRouter.get("/logout", verifyJwt, AsyncErrorHandler(logoutUser));
dashboardRouter.get("/refreshToken", AsyncErrorHandler(refreshAccessToken));
dashboardRouter.post(
  "/addMember",
  verifyJwt,
  checkDoctor,
  AsyncErrorHandler(addMember)
);
dashboardRouter.post(
  "/change-password",
  verifyJwt,
  checkDoctor,
  AsyncErrorHandler(changeCurrentPassword)
);
export default dashboardRouter;
