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
import client from "prom-client"

const app = express()

// ------------------- Prometheus Setup -------------------
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// -------------------- CORS SETUP --------------------
app.use(cors({
    origin: "*", // frontend origin (Vite)
    credentials: true, // allow cookies to be sent
  }));

// using builtin MiddleWares
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser());


// ---------------------------- Prometheus Metrics Endpoint ---------------------------
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
});

// ------------------------------Public Routes---------------------------
// Registered User Routes
app.use("/api/v1/users/registered", registeredUserRoutes)
// LoggedIn User Routes
app.use("/api/v1/users/loggedin",loggedInUserRoutes)
// Logout Routes
app.use("/api/v1/users/logout", loggedOutUserRoutes)
// Porgot password Routes
app.use("/api/v1/users/forgot-password-verification", existingUserRoutes )

// --------------------------- Protected Routes --------------------------
// Dashboard Routes
app.use("/api/v1/dashboard", dashboardRoutes)
// Habit Tracker Routes
app.use("/api/v1/dashboard/habit",habitTrackerRoutes)
// Expense Tracker Routes
// Investment Tracker Routes

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

