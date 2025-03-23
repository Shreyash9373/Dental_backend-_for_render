import express from "express";

import { AsyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import {
  getVisit,
  getDoctors,
  addPaymentForVisit,
  getReview,
  addReview,
  addVisit,
  deleteVisit,
  searchVisit,
  searchUnpaidOrPendingStatusVisit,
  searchVisitByPatientId,
  searchVisitsByDoctorId,
  updateVisit,
  getAllReviews,
  deletePaymentForVisit,
  updateReview,
  getAllShownReviews,
} from "../controllers/visit.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const visitRouter = express.Router();

// Prefix: /api/visits
// get visit
visitRouter.get(
  "/visit/:visitId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(getVisit)
);

// get doctors
visitRouter.get(
  "/doctors",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(getDoctors)
);

// add visit
visitRouter.post(
  "/",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(addVisit)
);

// delete visit
visitRouter.delete(
  "/:visitId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(deleteVisit)
);

// get review
visitRouter.get("/:visitId/review", AsyncErrorHandler(getReview));

// add review
visitRouter.post("/:visitId/review", AsyncErrorHandler(addReview));

// add payment
visitRouter.post(
  "/payment/:visitId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(addPaymentForVisit)
);

// delete payment
visitRouter.delete(
  "/payment/:visitId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(deletePaymentForVisit)
);

// search visits for a particular patient (patient history)
visitRouter.get(
  "/patient/:patientId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(searchVisitByPatientId)
);

// search visits for a particular doctor
visitRouter.get(
  "/doctor/:doctorId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(searchVisitsByDoctorId)
);

// search for visits with pending status
visitRouter.get(
  "/pending",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(searchUnpaidOrPendingStatusVisit)
);

// search for visits based on prescription or condition
visitRouter.get(
  "/search",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(searchVisit)
);

// update visit
visitRouter.put(
  "/:visitId",
  AsyncErrorHandler(verifyJwt),
  AsyncErrorHandler(updateVisit)
);

// get all reviews
visitRouter.get("/reviews", AsyncErrorHandler(getAllReviews));

// update review
visitRouter.put("/:visitId/review", AsyncErrorHandler(updateReview));

// get all shown reviews
visitRouter.get("/reviews/shown", AsyncErrorHandler(getAllShownReviews));

export default visitRouter;
