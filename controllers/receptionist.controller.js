import jwt from "jsonwebtoken";

import cookieOptions from "../constants.js";
import ReceptionistModel from "../models/receptionist.model.js";
import { genAccessAndRefreshTokens } from "../services/auth.service.js";
import { ResponseError } from "../utils/error.js";
import AppointmentModel from "../models/appointment.model.js";
import EnquiryModel from "../models/enquiry.model.js";

const receptionistLogin = async (req, res) => {
  // check email and password
  const { email, password } = req.body;
  if (!email || !password)
    throw new ResponseError(400, "Email and password required");

  //   check for admin
  const existingReceptionist = await ReceptionistModel.findOne({ email });
  if (!existingReceptionist)
    throw new ResponseError(
      404,
      "Invalid credentials or receptionist does not exists"
    );

  // validate payload
  const hasValidPassword = await existingReceptionist.isPasswordCorrect(
    password
  );
  if (!hasValidPassword)
    throw new ResponseError(
      400,
      "Invalid credentials or receptionist does not exists"
    );

  // create access and refresh tokens
  const { accessToken, refreshToken } = await genAccessAndRefreshTokens(
    existingReceptionist
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
      receptionist: {
        name: existingReceptionist.name,
        email: existingReceptionist.email,
      },
      accessToken,
      refreshToken,
      message: "Logged in successfully",
    });
};

const receptionistLogout = async (req, res) => {
  const receptionistId = req.receptionist._id;

  //   unset refreshToken
  await ReceptionistModel.findByIdAndUpdate(
    receptionistId,
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

const checkReceptionistRefreshToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken)
    throw new ResponseError(403, "Unauthorized request");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const receptionist = await ReceptionistModel.findById(decodedToken?._id);
  if (!receptionist) throw new ResponseError(403, "Invalid Refresh Token");

  return res.status(200).json({
    name: receptionist.name,
    email: receptionist.email,
    role: "receptionist",
    success: true,
    message: "Valid Receptionist",
  });
};

const bookAppointment = async (req, res) => {
  try {
    const {
      fullName,
      age,
      mobileNo,
      emailId,
      location,
      date,
      service,
      timeSlot,
      photo,
    } = req.body;
    console.log(req.body.date);
    const existingAppointment = await AppointmentModel.findOne({
      date: date,
      timeSlot: timeSlot,
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "The selected timeslot is already booked for this date.",
      });
    }
    if (
      (!fullName,
      mobileNo,
      !emailId,
      !location,
      !date,
      !service,
      !timeSlot,
      !age)
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    } else {
      const patientData = {
        fullName,
        mobileNo,
        emailId,
        location,
        date,
        service,
        timeSlot,
        photo,
        age,
      };
      const newPatient = new AppointmentModel(patientData);
      const patientSaved = await newPatient.save();
      if (patientSaved) {
        return res
          .status(201)
          .json({ success: true, message: "Appointment booked successfully" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Failed to book appointment" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getAppointment = async (req, res) => {
  try {
    // YYYY/MM/DD- date format
    const { date } = req.body;
    console.log(req.body);
    const appointment = await AppointmentModel.find({ date });

    if (appointment.length > 0) {
      return res.status(200).json({ success: true, appointment });
    } else if (appointment.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No appointment found" });
    } else {
      return res.status(400).json({ success: false, message: "Network error" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getEnquiry = async (req, res) => {
  const enquiryData = await EnquiryModel.find({});
  if (enquiryData.length > 0) {
    return res.status(200).json({ success: true, enquiryData });
  } else if (enquiryData.length === 0) {
    return res.status(200).json({ success: true, message: "No Enquiry" });
  } else {
    return res.status(400).json({ success: false, message: "Network error" });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const {
      _id,
      fullName,
      mobileNo,
      service,
      timeSlot,
      date,
      status,
      paymentStatus,
      paymentAmount,
    } = req.body;

    if (
      !_id ||
      !fullName ||
      !mobileNo ||
      !service ||
      !timeSlot ||
      !date ||
      !status
    ) {
      return res.json({ success: false, message: "Data Missing" });
    }

    const response = await AppointmentModel.findByIdAndUpdate(_id, {
      _id,
      fullName,
      mobileNo,
      service,
      timeSlot,
      date,
      status,
      paymentStatus,
      paymentAmount,
    });
    if (response) {
      return res
        .status(200)
        .json({ success: true, message: "Profile Updated" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Failed to Update" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Fetch available time slots based on the date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    // List of all possible time slots
    const allTimeSlots = [
      "9:00 AM",
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "2:00 PM",
      "3:00 PM",
    ];

    // Fetch appointments for the specified date
    const bookedAppointments = await AppointmentModel.find({ date }).select(
      "timeSlot"
    );

    // Extract already booked slots
    const bookedTimeSlots = bookedAppointments.map(
      (appointment) => appointment.timeSlot
    );

    // Calculate available slots
    const availableSlots = allTimeSlots.filter(
      (slot) => !bookedTimeSlots.includes(slot)
    );

    return res.status(200).json({ availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  receptionistLogin,
  receptionistLogout,
  checkReceptionistRefreshToken,
  bookAppointment,
  getAppointment,
  getEnquiry,
  updateAppointment,
  getAvailableSlots,
};
