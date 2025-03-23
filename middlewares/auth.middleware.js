import jwt from "jsonwebtoken";

import DoctorModel from "../models/doctor.model.js";
import { ResponseError } from "../utils/error.js";
import ReceptionistModel from "../models/receptionist.model.js";

const verifyJwt = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ResponseError(401, "No token provided");

  // Verify the token
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const receptionist = await ReceptionistModel.findById(
    decodedToken?._id
  ).select("-password -refreshToken");

  if (!receptionist) {
    const doctor = await DoctorModel.findById(decodedToken._id);
    if (!doctor)
      throw new ResponseError(400, "Neither a receptionist nor a doctor");
    else req.doctor = doctor;
  } else req.receptionist = receptionist;

  next();
};

const verifyDoctor = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  // Verify the token
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // Find the doctor and exclude sensitive fields
  const doctor = await DoctorModel.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!doctor) throw new ResponseError(401, "Invalid access token");

  // Attach the doctor to the request object
  req.doctor = doctor;
  next();
};

const verifyReceptionist = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  // Verify the token
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // Find the doctor and exclude sensitive fields
  const receptionist = await ReceptionistModel.findById(
    decodedToken?._id
  ).select("-password -refreshToken");

  if (!receptionist) throw new ResponseError(401, "Invalid access token");

  // Attach the receptionist to the request object
  req.receptionist = receptionist;
  next();
};

export { verifyJwt, verifyDoctor, verifyReceptionist };
