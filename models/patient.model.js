import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

function generatePRN() {
  const MIN = 123_456; // Minimum 6-digit number
  const MAX = 999_999; // Maximum 6-digit number
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

const patientSchema = new mongoose.Schema(
  {
    prn: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          // Regex for validating alphanumeric names, 3-30 characters
          return /^[a-zA-Z\s.]{3,30}$/.test(value);
        },
        message: "Name must be 3-30 characters long.",
      },
    },
    mobile: {
      type: String,
      unique: true,
      required: [true, "Mobile is required"],
      validate: {
        validator: (v) => {
          return /^[0-9]{10}$/.test(v);
        },
      },
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      validate: {
        validator: (v) => {
          return v > 0 && v < 110;
        },
      },
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true, // This ensures the uniqueness constraint only applies when it's not null
      validate: {
        validator: function (value) {
          // Simple regex to check email format
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
          return emailRegex.test(value);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure the PNR is unique
patientSchema.pre("save", async function (next) {
  if (this.isNew) {
    // only for new docs
    let prn = generatePRN();

    while (await mongoose.models.Patient.findOne({ prn })) {
      prn = generatePRN();
    }

    this.prn = prn;
  }
  next();
});

// Method to validate password
patientSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate access token
patientSchema.methods.generateAccessTokens = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET || "defaultAccessTokenSecret",
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h", // Default to 1 hour if not set
    }
  );
};

// Method to generate refresh token
patientSchema.methods.generateRefreshTokens = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || "defaultRefreshTokenSecret",
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d", // Default to 7 days if not set
    }
  );
};

const PatientModel = mongoose.model("Patient", patientSchema);
export default PatientModel;
