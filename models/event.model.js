import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      //   default:
      //     "https://www.manila-hotel.com.ph/wp-content/uploads/2020/08/WEB-FIESTA-CONFERENCE-SET-UP-scaled-1.jpg",
    },
  },
  { timestamps: true }
);

const EventModel = mongoose.model("Event", eventSchema);

export default EventModel;
