import PhysicalLog from "../../models/Habit-models/physicalLog.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asynchandler from "../../utils/asyncHandler.js";

// @POST: Add a new physical log
const addPhysicalLog = asynchandler(async (req, res) => {
    const user = req.user;
    const { weight, height, bmi } = req.body;

    if (!user) {
        throw new ApiError(401, "Unauthorized: User not found");
    }

    if (!weight || !height || !bmi) {
        throw new ApiError(400, "Weight, Height, and BMI are required");
    }

    const newLog = await PhysicalLog.create({
        userId: user._id,
        weight,
        height,
        bmi,
        date: new Date(),
    });

    return res.status(201).json(
        new ApiResponse(201, newLog, "Physical log added successfully")
    );
});

// @GET: Get all physical logs for the user
const getPhysicalLogs = asynchandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized: User not found");
    }

    const logs = await PhysicalLog.find({ userId: user._id }).sort({ date: 1 });

    return res.status(200).json(
        new ApiResponse(200, logs, "Physical logs fetched successfully")
    );
});

// @DELETE: Delete a physical log
const deletePhysicalLog = asynchandler(async (req, res) => {
    const user = req.user;
    const { logId } = req.params;

    if (!user) {
        throw new ApiError(401, "Unauthorized: User not found");
    }

    const deletedLog = await PhysicalLog.findOneAndDelete({ _id: logId, userId: user._id });

    if (!deletedLog) {
        throw new ApiError(404, "Log not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedLog, "Physical log deleted successfully")
    );
});

export {
    addPhysicalLog,
    getPhysicalLogs,
    deletePhysicalLog,
};
