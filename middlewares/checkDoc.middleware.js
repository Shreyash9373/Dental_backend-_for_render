import jwt from "jsonwebtoken";
import dashboardLogin from "../models/dashboardloginSchema.js"; // Correct import for default export

const checkDoctor = async (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch user details from the database
        const user = await dashboardLogin.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid access token" });
        }

        // Check if the user role is 'doctor'
        if (user.role === "doctor") {
            req.user = user; // Attach user data to the request object for further use
            next();
        } else {
            return res.status(403).json({ success: false, message: "Access denied. Not a doctor" });
        }
    } catch (error) {
        console.error("Error in checkDoctor middleware:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token has expired" });
        } else {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
};

export default checkDoctor;
