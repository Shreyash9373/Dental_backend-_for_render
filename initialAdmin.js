import mongoose from "mongoose";
import DoctorModel from "./models/doctor.model.js";
import connectMongo from "./db/connectMongo.js";
import "dotenv/config";

export const initialAdmin = async () => {
  try {
    console.log("🟡 Connecting to MongoDB...");
    await connectMongo(); // Ensure this is awaited

    console.log("🟡 Checking if admin user exists...");
    const existingDoctor = await DoctorModel.findOne({
      email: "admin@gmail.com",
    });

    if (existingDoctor) {
      console.log("⚡ Admin user already exists. Skipping creation.");
      return;
    }

    console.log("🟡 Creating admin user...");
    await DoctorModel.create({
      name: "admin",
      email: "admin@gmail.com",
      password: process.env.adminPass, // Assuming password hashing is handled in the model
    });

    console.log("✅ Admin user created successfully.");
  } catch (error) {
    console.error("❌ Error creating initial admin:", error);
  } finally {
    console.log("🔴 Closing MongoDB connection...");
    mongoose.connection.close();
  }
};

// Run the script manually
// if (import.meta.url === `file://${process.argv[1]}`) {
//   console.log("🔵 Running initialAdmin script...");
//   initialAdmin().then(() => console.log("🟢 Script execution finished."));
// }
initialAdmin();
