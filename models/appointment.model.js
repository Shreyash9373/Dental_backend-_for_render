import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // Ensures a valid 10-digit mobile number
    },
    emailId: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Ensures a valid email format
    },
    age: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // You can use predefined slots like "10:00 AM - 10:30 AM"
    },
    photo: {
      type: String, // This field can store the file URL or path
      required: false, // Optional field
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"], // Allowed values
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields automatically

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
export default AppointmentModel;
