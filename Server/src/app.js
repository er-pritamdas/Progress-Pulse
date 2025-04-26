// Importing neccessary Files and Folders
import express from "express";
import registeredUserRoutes from "../routes/User-routes/registeredUser.routes.js";
import loggedInUserRoutes from "../routes/User-routes/loggedInUser.routes.js";
import dashboardRoutes from "../routes/Dashboard-routes/dashboard.routes.js";
import habitTrackerRoutes from "../routes/Habit-routes/HabitTracker.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import loggedOutUserRoutes from "../routes/User-routes/loggedOutUser.routes.js";
import existingUserRoutes from "../routes/User-routes/existingUser.routes.js";
// import nodemailer from "nodemailer";

const app = express()

// -------------------- CORS SETUP --------------------
app.use(cors({
    origin: "http://localhost:5173", // frontend origin (Vite)
    credentials: true, // allow cookies to be sent
  }));


// using builtin MiddleWares
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser());


// ------------------------------Public Routes---------------------------
// Registered User Routes
app.use("/api/v1/users/registered", registeredUserRoutes)
// LoggedIn User Routes
app.use("/api/v1/users/loggedin",loggedInUserRoutes)

app.use("/api/v1/users/logout", loggedOutUserRoutes)


app.use("/api/v1/users/forgot-password-verification", existingUserRoutes )
// --------------------------- Protected Routes --------------------------
// Dashboard Routes
app.use("/api/v1/dashboard", dashboardRoutes)
// Habit Tracker Routes
app.use("/api/v1/dashboard/habit",habitTrackerRoutes)


// ------------------------ Global Error Handling -----------------------
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.statusCode,
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors,
    });
});

export default app

