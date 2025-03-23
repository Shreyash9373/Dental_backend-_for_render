import DoctorModel from "../models/doctor.model.js";
import PatientModel from "../models/patient.model.js";
import VisitModel from "../models/visit.model.js";
import { ResponseError } from "../utils/error.js";

const getVisit = async (req, res) => {
  const { visitId } = req.params;

  const visit = await VisitModel.findById(visitId);
  if (!visit) throw new ResponseError(400, "Visit does not exists");

  // populate with doctor data if it exists
  const doctor = await DoctorModel.findOne(
    { _id: visit.doctor },
    { _id: 1, name: 1 }
  );

  return res.status(200).json({
    success: true,
    visit: {
      ...visit._doc,
      doctor: doctor ? doctor : visit.doctor,
    },
  });
};

const getDoctors = async (req, res) => {
  const doctors = await DoctorModel.find({}, { _id: 1, name: 1 });
  if (!doctors) throw new ResponseError(400, "Visit does not exists");

  return res.status(200).json({
    success: true,
    doctors,
  });
};

const addVisit = async (req, res) => {
  // TODO: get all fields (also do this for create operation for all resources)
  let {
    doctor,
    patientId,
    condition,
    prescription,
    totalAmount,
    isDoctorVisiting,
  } = req.body;

  totalAmount = parseFloat(totalAmount);

  if (isNaN(totalAmount) && totalAmount > 0)
    throw new ResponseError(400, "Total amount must be greater than 0");

  const visit = await VisitModel.create({
    doctor,
    patientId,
    condition,
    prescription,
    totalAmount,
    isDoctorVisiting,
  });

  return res.status(201).json({
    success: true,
    visit,
    message: "Visit added successfully",
  });
};

const deleteVisit = async (req, res) => {
  const { visitId } = req.params;
  if (!visitId) throw new ResponseError(400, "Visit does not exsits");

  const result = await VisitModel.findByIdAndDelete(visitId);
  return res.status(200).json({
    success: true,
    result,
    message: "Visit deleted successfully",
  });
};

const addPaymentForVisit = async (req, res) => {
  const { visitId } = req.params;
  let { amount } = req.body;

  amount = parseFloat(amount);

  if (isNaN(amount) || amount <= 0)
    throw new ResponseError(400, "Amount should be a greater than 0");

  const visit = await VisitModel.findById(visitId);
  visit.makePayment(amount);

  return res.status(200).json({
    success: true,
    visit,
  });
};

const deletePaymentForVisit = async (req, res) => {
  const { visitId } = req.params;
  const { id } = req.body;

  if (!id) throw new ResponseError(400, "Payment id required");

  // const visit = await VisitModel.findByIdAndUpdate(visitId, {
  //   $pull: { payments: { _id: id } },
  // });
  const visit = await VisitModel.findById(visitId);
  if (!visit) throw new ResponseError(400, "Visit does not exists");

  const payments = visit.payments.filter(
    (payment) => payment._id.toString() !== id
  );

  visit.payments = payments;
  visit.save();

  return res.status(200).json({
    success: true,
    message: "Visit deleted successfully",
    visit,
  });
};

const getReview = async (req, res) => {
  const { visitId } = req.params;

  const visit = await VisitModel.findById(visitId);
  if (!visit) throw new ResponseError(404, "Visit not found");
  else
    return res.status(200).json({
      review: visit.review ? visit.review : null,
    });
};

const addReview = async (req, res) => {
  const { visitId } = req.params;
  let { rating, description } = req.body;

  rating = parseInt(rating);
  if (isNaN(rating) || rating > 5 || rating < 0)
    throw new ResponseError(400, "Rating should be between 0-5");

  const visit = await VisitModel.findById(visitId);
  if (!visit) throw new ResponseError(404, "Visit not found");

  if (visit.review)
    throw new ResponseError(400, "This visit already has a review");
  else {
    visit.review = {
      rating,
      description,
    };
    await visit.save();
  }

  return res.status(200).json({
    success: true,
    visit,
  });
};

const searchVisitByPatientId = async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) throw new ResponseError(400, "Patient Id is required");

  const visits = await VisitModel.find({ patientId });
  if (!visits) throw new ResponseError(400, "No patient found!");

  // const visits = await VisitModel.find({ patientId });

  return res.status(200).json({
    success: true,
    visits,
  });
};

const searchUnpaidOrPendingStatusVisit = async (req, res) => {
  const visits = await VisitModel.find({
    $or: [{ paymentStatus: "UNPAID" }, { paymentStatus: "PENDING" }],
  });

  return res.status(200).json({
    success: true,
    visits,
  });
};

const searchVisitsByDoctorId = async (req, res) => {
  const { doctorId } = req.params;
  if (!doctorId) throw new ResponseError(400, "Doctor Id is required");

  const existingDoctor = await DoctorModel.findById(doctorId);
  if (!existingDoctor) throw new ResponseError(404, "Doctor does not exists");

  const visits = await VisitModel.find({ doctor: existingDoctor._id });

  return res.status(200).json({
    success: true,
    visits,
  });
};

const searchVisit = async (req, res) => {
  const { condition, prescription } = req.query;
  let filteredVisits = [];

  if (condition || prescription) {
    filteredVisits = await VisitModel.find({
      $or: [
        { condition: RegExp(`(?=.*${condition?.split("").join(".*")})`, "i") },
        {
          prescription: RegExp(
            `(?=.*${prescription?.split("").join(".*")})`,
            "i"
          ),
        },
      ],
    });
  }

  return res.status(200).json({
    success: true,
    visits: filteredVisits,
  });
};

const updateVisit = async (req, res) => {
  const { visitId } = req.params;
  const {
    doctor,
    patientId,
    condition,
    prescription,
    paymentStatus,
    totalAmount,
    isDoctorVisiting,
  } = req.body;

  const visit = await VisitModel.findById(visitId);
  if (!visit) throw new ResponseError(400, "Visit not found");

  // visit.doctor = doctor || visit.doctor;
  // visit.patientId = patientId || visit.patientId;
  // visit.condition = condition || visit.condition;
  // visit.prescription = prescription || visit.prescription;
  // visit.paymentStatus = paymentStatus || visit.paymentStatus;
  // visit.totalAmount = totalAmount || visit.totalAmount;
  // visit.isDoctorVisiting = isDoctorVisiting !== || visit.isDoctorVisiting;

  if (doctor !== undefined && doctor !== visit.doctor) visit.doctor = doctor;
  if (condition !== undefined && condition !== visit.condition)
    visit.condition = condition;
  if (prescription !== undefined && prescription !== visit.prescription)
    visit.prescription = prescription;
  if (paymentStatus !== undefined && paymentStatus !== visit.paymentStatus)
    visit.paymentStatus = paymentStatus;
  if (totalAmount !== undefined && totalAmount !== visit.totalAmount)
    visit.totalAmount = totalAmount;
  if (
    isDoctorVisiting !== undefined &&
    isDoctorVisiting !== visit.isDoctorVisiting
  )
    visit.isDoctorVisiting = isDoctorVisiting;

  await visit.save();
  return res.status(200).json({
    success: true,
    visit,
    message: "Visit updated",
  });
};

const getAllReviews = async (req, res) => {
  let { rating } = req.query;

  rating = parseInt(rating);

  if (isNaN(rating)) throw new ResponseError(400, "Rating must be between 1-5");

  const reviews = await VisitModel.find(
    { "review.rating": rating },
    {
      "review.rating": 1,
      "review.description": 1,
      "review.shown": 1,
      // _id: 1,
    }
  ).populate("patientId", { name: 1, _id: 0 });
  // .select("patientId.mobile");

  res.status(200).json({
    success: true,
    reviews: reviews
      .filter(({ review }) => Object.keys(review._doc).length !== 0)
      .map((review) => ({
        visitId: review._id,
        ...review.patientId._doc,
        ...review.review._doc,
      })),
  });
};

const updateReview = async (req, res) => {
  const { visitId } = req.params;
  const { shown } = req.body;

  const visit = await VisitModel.findById(visitId);
  if (!visit) throw new ResponseError(404, "Visit not found");

  if (visit.review.shown !== shown) {
    visit.review.shown = shown;
    visit.save();
  }
  return res.status(200).json({
    success: true,
    message: "Review added to main site",
    visit,
  });
};

const getAllShownReviews = async (req, res) => {
  const reviews = (
    await VisitModel.find(
      { "review.shown": true },
      { review: 1, _id: 0 }
    ).populate("patientId", { name: 1, _id: 0 })
  )
    .filter((review) => Object.keys(review._doc).length !== 0)
    .map((review) => {
      review._doc._id = undefined;
      review.review._doc._id = undefined;
      review.review._doc.shown = undefined;
      return { ...review.review._doc, ...review.patientId._doc };
    });

  return res.status(200).json({
    reviews,
  });
};

export {
  getVisit,
  getDoctors,
  addVisit,
  deleteVisit,
  addPaymentForVisit,
  deletePaymentForVisit,
  getReview,
  addReview,
  searchVisitByPatientId,
  searchUnpaidOrPendingStatusVisit,
  searchVisitsByDoctorId,
  searchVisit,
  updateVisit,
  getAllReviews,
  updateReview,
  getAllShownReviews,
};
