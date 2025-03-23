import mongoose, { Schema } from "mongoose";
import { ResponseError } from "../utils/error.js";

// Payment schema for individual payments
const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Review schema
const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3, 4, 5],
    validate: {
      validator: function (value) {
        // This ensures that the value is an integer between 0 and 5
        return Number.isInteger(value) && value >= 0 && value <= 5;
      },
      message: "Star rating must be an integer between 0 and 5.",
    },
  },
  description: {
    type: String,
  },
  shown: {
    type: Boolean,
    default: false,
  },
});

const visitSchema = new mongoose.Schema(
  {
    doctor: {
      type: String,
      required: [true, "Cannot have visit without doctor"],
      trim: true,
      // lowercase: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    condition: {
      type: String,
    },
    prescription: {
      type: String,
    },
    payments: {
      type: [paymentSchema],
      required: true,
      default: [],
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
    payedAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    isDoctorVisiting: {
      type: Boolean,
      required: true,
      default: false,
    },
    review: {
      type: reviewSchema,
      required: false,
    },
  },
  { timestamps: true }
);

// pre hook to ensure total doesn't become less than paid
visitSchema.pre("save", function (next) {
  if (!this.isModified("totalAmount")) next();
  else {
    if (this.totalAmount < this.payedAmount)
      throw new ResponseError(
        400,
        "Amount cannot become less than paid amount. Delete a payment if you think this is an mistake"
      );
    else next();
  }
});

// pre hook to ensure data consistency when adding a payment
visitSchema.pre("save", function (next) {
  if (!this.isModified("payments")) next();
  else {
    // ensure that payedAmount reflects total amount of payments
    const totalPaymentAmount = this.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    this.payedAmount = totalPaymentAmount;

    // if totalAmount == payedAmount, change payemntStatus to PAID
    if (this.payedAmount === this.totalAmount) this.paymentStatus = "PAID";
    else this.paymentStatus = "PENDING";

    next();
    // if(this.totalAmount !== totalPaymentAmount)
    //   next(new Error("Data inconsistency: 'totalAmount' should be equal to total amount of payments"));
  }
});

visitSchema.methods.makePayment = function (amount) {
  // ensure that sum of this amount and payedAmount does not exceed totalAmount
  if (amount + this.payedAmount > this.totalAmount)
    throw new ResponseError(400, "Payment exceeds total amount to be paid");

  // make payment
  this.payments.push({ amount });

  this.save();
};

const VisitModel = mongoose.model("Visit", visitSchema);
export default VisitModel;
