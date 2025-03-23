import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connected")
    );
    await mongoose.connect(`${process.env.MONGODB_URI}`);
  } catch (error) {
    console.log("Error in connectMongo.js", error);
  }
};

export default connectMongo;
