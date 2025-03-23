import express from "express";
import cors from "cors";
import connectMongo from "./db/connectMongo.js";
import "dotenv/config";
import receptionRouter from "./routes/receptionRoute.js";
import patientRouter from "./routes/patientRoute.js";
import cookieParser from "cookie-parser";
import dashboardRouter from "./routes/dashboardRoute.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import bodyParser from "body-parser"; // Import body-parser

import doctorRouter from "./routes/doctorRoute.js";
import receptionistRoutes from "./routes/receptionist.route.js";
import patientRoutes from "./routes/patient.route.js";
import visitRouter from "./routes/visit.route.js";

const app = express();
const port = 4000;

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        // !origin allows requests from non-browser clients (like Postman)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent/received
  })
);

connectMongo();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser()); // for reading and writing cookies in user's browser

app.get("/", (req, res) => {
  res.send("api working perfectly version 2");
});

//api endpoints
app.use("/api/receptionists", receptionistRoutes);
app.use("/api/doctors", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/patients", patientRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/visits", visitRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
