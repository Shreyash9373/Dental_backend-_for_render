import express from "express";
import {
  saveEnquiry,
  getEvent,
  getBlog,
  getSingleBlog,
  getSingleEvent,
} from "../controllers/patientController.js";
import { AsyncErrorHandler } from "../utils/AsyncErrorHandler.js";

const patientRouter = express.Router();

patientRouter.post("/save-enquiry", saveEnquiry);
patientRouter.get("/get-event", getEvent);
patientRouter.get("/get-blog", getBlog);
patientRouter.get("/get-singleblog", AsyncErrorHandler(getSingleBlog));
patientRouter.get("/get-singleevent", AsyncErrorHandler(getSingleEvent));

export default patientRouter;
