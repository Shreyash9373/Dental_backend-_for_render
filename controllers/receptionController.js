import appointmentSchema from "../models/appointment.model.js";
import enquirySchema from "../models/enquiry.model.js";

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
    const existingAppointment = await appointmentSchema.findOne({
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
      const newPatient = new appointmentSchema(patientData);
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

const getPatient = async (req, res) => {
  try {
    // YYYY/MM/DD- date format
    const { date } = req.body;
    console.log(req.body);
    const patient = await appointmentSchema.find({ date });

    if (patient.length > 0) {
      return res.status(200).json({ success: true, patient });
    } else if (patient.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No patient found" });
    } else {
      return res.status(400).json({ success: false, message: "Network error" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getEnquiry = async (req, res) => {
  const enquiryData = await enquirySchema.find({});
  if (enquiryData.length > 0) {
    return res.status(200).json({ success: true, enquiryData });
  } else if (enquiryData.length === 0) {
    return res.status(200).json({ success: true, message: "No Enquiry" });
  } else {
    return res.status(400).json({ success: false, message: "Network error" });
  }
};

const updatePatient = async (req, res) => {
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

    const response = await appointmentSchema.findByIdAndUpdate(_id, {
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
    const bookedAppointments = await appointmentSchema
      .find({ date })
      .select("timeSlot");

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
  bookAppointment,
  getPatient,
  getEnquiry,
  updatePatient,
  getAvailableSlots,
};
