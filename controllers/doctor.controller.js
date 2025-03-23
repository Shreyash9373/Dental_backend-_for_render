import jwt from "jsonwebtoken";

import cookieOptions from "../constants.js";
import DoctorModel from "../models/doctor.model.js";
import ReceptionistModel from "../models/receptionist.model.js";
import { genAccessAndRefreshTokens } from "../services/auth.service.js";
import { ResponseError } from "../utils/error.js";

const doctorLogin = async (req, res) => {
  // check email and password
  const { email, password } = req.body;
  if (!email || !password)
    throw new ResponseError(400, "Email and password required");

  const existingDoctor = await DoctorModel.findOne({ email });
  if (!existingDoctor)
    throw new ResponseError(
      404,
      "Invalid credentials or doctor does not exists"
    );

  // validate payload
  const hasValidPassword = await existingDoctor.isPasswordCorrect(password);
  if (!hasValidPassword)
    throw new ResponseError(
      400,
      "Invalid credentials or doctor does not exists"
    );

  // create access and refresh tokens
  const { accessToken, refreshToken } = await genAccessAndRefreshTokens(
    existingDoctor
  );

  // Cookie options
  const accessTokenOptions = cookieOptions("access");
  const refreshTokenOptions = cookieOptions("refresh");
  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json({
      success: true,
      doctor: {
        name: existingDoctor.name,
        email: existingDoctor.email,
      },
      accessToken,
      refreshToken,
      message: "Logged in successfully",
    });
};

const doctorRegister = async (req, res) => {
  // check for name, email and password
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new ResponseError(400, "Invalid data");

  // check for existing doctor
  const existingDoctor = await DoctorModel.findOne({ email });
  if (existingDoctor)
    throw new ResponseError(400, "This email is already registered");

  // create doctor
  const doctor = await DoctorModel.create({
    name,
    email,
    password,
  });
  // doctor.password = undefined;

  return res.status(201).json({
    success: true,
    doctor,
    message: "Doctor registered successfully",
  });
};

const doctorLogout = async (req, res) => {
  const doctorId = req.doctor._id;

  //   unset refreshToken
  await DoctorModel.findByIdAndUpdate(
    doctorId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // clear cookies
  const accessTokenOptions = cookieOptions("access");
  const refreshTokenOptions = cookieOptions("refresh");
  return res
    .status(200)
    .clearCookie("accessToken", accessTokenOptions)
    .clearCookie("refreshToken", refreshTokenOptions)
    .json({ success: true, msg: "Logged out successfully" });
};

const checkDoctorRefreshToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken)
    throw new ResponseError(403, "Unauthorized request");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const doctor = await DoctorModel.findById(decodedToken?._id);
  if (!doctor) throw new ResponseError(403, "Invalid Refresh Token");

  return res.status(200).json({
    id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    role: "doctor",
    success: true,
    message: "Valid Doctor",
  });
};

const getDoctorDetails = async (req, res) => {
  req.doctor["__v"] = undefined;
  req.doctor["createdAt"] = undefined;
  req.doctor["updatedAt"] = undefined;

  return res.status(200).json({
    success: true,
    doctor: req.doctor,
  });
};

const updateDoctor = async (req, res) => {
  let { name, email, password, qualification, experience, description, image } =
    req.body;

  image = req.file ? req.file.path : undefined;
  experience = parseInt(experience);

  if (experience !== undefined && experience && isNaN(experience)) {
    throw new ResponseError(400, "Experience must be a number");
  }

  const doctor = req.doctor;
  if (!doctor)
    throw new ResponseError(
      400,
      "Invalid credentials or doctor does not exists"
    );

  if (name && name !== doctor.name) doctor.name = name;
  if (email && email !== doctor.email) doctor.email = email;
  if (password && password !== doctor.password) doctor.password = password;
  if (qualification && qualification !== doctor.qualification)
    doctor.qualification = qualification;
  if (experience && experience !== doctor.experience)
    doctor.experience = experience;
  if (description && description !== doctor.description)
    doctor.description = description;

  if (image && image !== doctor.image) doctor.image = image;

  const response = await doctor.save({ validateBeforeSave: false });
  // const response = await doctor.save();
  if (response) {
    return res
      .status(200)
      .json({ success: true, message: "Doctor update successfully" });
  } else throw new ResponseError(400, "Unable to update");
};

const addAccount = async (req, res) => {
  const { role, name, email, password } = req.body;

  // validate payload
  if (!role || !email || !password)
    throw new ResponseError(400, "Role, email and password required");

  if (role === "doctor") {
    if (!name) throw new ResponseError(400, "Name for doctor is required");

    // check for existing
    const exisitingDoctor = await DoctorModel.findOne({ email });
    if (exisitingDoctor)
      throw new ResponseError(400, "This email is already registered");

    // add to db
    const doctor = await DoctorModel.create({
      name,
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor regsitered successfully",
    });
  } else if (role === "receptionist") {
    // check for existing
    const exisitingReceptionist = await ReceptionistModel.findOne({ email });
    if (exisitingReceptionist)
      throw new ResponseError(400, "This email is already registered");

    // add to db
    const receptionist = await ReceptionistModel.create({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Receptionist regsitered successfully",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: `Cannot add ${role}`,
    });
  }
};

const getAllReceptionist = async (req, res) => {
  const receptionists = await ReceptionistModel.find();
  return res.status(200).json({
    success: true,
    receptionists,
  });
};

const deleteReceptionist = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ResponseError(400, "Invalid email");

  await ReceptionistModel.deleteOne({ email });
  return res.status(200).json({
    success: true,
    message: "Receptionists deleted successfully",
  });
};

const changeReceptionistPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ResponseError(400, "Invalid email or password");

  const receptionist = await ReceptionistModel.findOne({ email });
  if (!receptionist)
    throw new ResponseError(
      400,
      "Invalid credentials or receptionist does not exists"
    );

  receptionist.password = password;
  // const response = await receptionist.save({ validateBeforeSave: false });
  const response = await receptionist.save();
  if (response) {
    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } else throw new ResponseError(400, "Unable to change password");
};

export {
  doctorLogin,
  doctorRegister,
  doctorLogout,
  checkDoctorRefreshToken,
  getDoctorDetails,
  updateDoctor,
  addAccount,
  getAllReceptionist,
  deleteReceptionist,
  changeReceptionistPassword,
};
