import eventSchema from "../models/event.model.js";
import blogSchema from "../models/blog.model.js";
import cloudinary from "../config/cloudinary.js"; // Adjust the path to your Cloudinary configuration

const addEvent = async (req, res) => {
  try {
    const { title, date, time, location, description } = req.body;

    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Upload the image to Cloudinary
    const imageUrl = req.file.path;

    // Create a new event with the uploaded image URL
    const newEvent = {
      title,
      date,
      time,
      location,
      description,
      image: imageUrl, // Cloudinary's secure URL
    };

    // Save the event to the database
    const eventSaved = await new eventSchema(newEvent).save();

    if (eventSaved) {
      return res.status(201).json({
        success: true,
        message: "Event added successfully!",
        data: eventSaved,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to save event. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the event.",
      error: error.message,
    });
  }
};

const addBlogs = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Upload the image to Cloudinary
    const imageUrl = req.file.path;

    // Create a new event with the uploaded image URL
    const newBlog = {
      title,
      description,
      image: imageUrl, // Cloudinary's secure URL
    };

    // Save the event to the database
    const blogSaved = await new blogSchema(newBlog).save();

    if (blogSaved) {
      return res.status(201).json({
        success: true,
        message: "Blog added successfully!",
        data: blogSaved,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to save blog. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the blog.",
      error: error.message,
    });
  }
};

export { addEvent, addBlogs };
