import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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

const BlogModel = mongoose.model("Blog", blogSchema);

export default BlogModel;
