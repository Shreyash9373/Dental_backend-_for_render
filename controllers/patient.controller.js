import PatientModel from "../models/patient.model.js";
import { ResponseError } from "../utils/error.js";

const getPatient = async (req, res) => {
  const { patientId } = req.params;

  const patient = await PatientModel.findById(patientId);

  return res.status(200).json({
    success: true,
    patient,
  });
};

const addPatient = async (req, res) => {
  const { name, mobile, age, email } = req.body;

  if (!name || !mobile || !age)
    throw new ResponseError(400, "Name, Mobile and age required!");

  const existingPatient = await PatientModel.findOne({ mobile });

  if (existingPatient)
    throw new ResponseError(409, "This mobile number is already registered!");

  const patient = await PatientModel.create({
    name,
    mobile,
    age,
    email,
  });

  return res.status(201).json({
    success: true,
    msg: "Patient added successfully",
    patient,
  });
};

const searchPatient = async (req, res) => {
  const { searchTerm } = req.query;

  let filteredPatients = [];

  filteredPatients = await PatientModel.find({
    $or: [
      { name: RegExp(`(?=.*${searchTerm?.split("").join(".*")})`, "i") },
      { mobile: RegExp(`(?=.*${searchTerm?.split("").join(".*")})`, "i") },
      { email: RegExp(`(?=.*${searchTerm?.split("").join(".*")})`, "i") },
    ],
  });

  return res.status(200).json({
    success: true,
    patients: filteredPatients,
  });
};

const updatePatient = async (req, res) => {
  const { patientId } = req.params;
  let { name, mobile, age, email } = req.body;
  age = age ? parseInt(age) : undefined;

  if (age !== undefined && isNaN(age)) {
    throw new ResponseError(400, "Age must be a number");
  }

  const patient = await PatientModel.findById(patientId);

  if (name && name !== patient.name) patient.name = name;
  if (mobile && mobile !== patient.mobile) patient.mobile = mobile;
  if (age && age !== patient.age) patient.age = age;
  if (email && email !== patient.email) patient.email = email;

  const result = await patient.save();
  if (result)
    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
    });
  else throw new ResponseError(400, "Something went wrong");
};

export { getPatient, addPatient, searchPatient, updatePatient };
