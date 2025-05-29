// Import Statements
import bcrypt from "bcryptjs";
import asyncHandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import logger from "../../utils/Logging.js";

// Check if User is Already Present
const isUserPresent = asyncHandler(
    async (req, res, next) => {

        const { username, email, password } = req.body;
        logger.info("")
        logger.info(`NEW USER - ${username}`)
        logger.info("---------- Is User Present ----------");
        logger.info("API HIT -> /api/v1/users/registered/");

        if (!username) {
            logger.warn("Validation Error: Username is missing");
            throw new ApiError(400, "Username is required");
        }
        if (!email) {
            logger.warn("Validation Error: Email is missing");
            throw new ApiError(400, "Email is required");
        }
        if (!password) {
            logger.warn("Validation Error: Password is missing");
            throw new ApiError(400, "Password is required");
        }

        const userExist = await RegisteredUsers.findOne({ username });
        if (userExist) {
            logger.warn(`Conflict: User '${username}' already exists`);
            throw new ApiError(409, "User Already Present");
        }

        logger.info(`Validation Passed: USER - '${username}' can be registered`);
        logger.info("---------- Next Middleware ----------");
        next();
    }
);

// Create New User Entry
const newUserEntry = asyncHandler(
    async (req, res, next) => {

        const { username, email, password } = req.body;
        logger.info("")
        logger.info(`NEW USER - ${username}`)
        logger.info("---------- New User Entry ----------");
        logger.info(`API HIT -> /api/v1/users/registered/`);
        logger.info(`Creating user entry for '${username}'`);

        try {
            const encryptPassword = await bcrypt.hash(password, 10);
            logger.info(`Password encrypted successfully for '${username}'`);

            const createUser = await RegisteredUsers.create({
                username,
                email,
                passwordHash: encryptPassword,
            });
            logger.info(`USER - '${username}' created successfully in DB`);

            res.status(201).json(new ApiResponse(201, {username, email}, "User Registered successfully"));
            logger.info(`USER - '${username}' Registered Successfully`);

            logger.info("---------- Next Middleware ----------");
            next();

        } catch (error) {
            logger.error(`Error creating user '${username}': ${error.message}`, {
                stack: error.stack,
            });
            throw new ApiError(409, error.message);
        }
    }
);

// Exports
export { isUserPresent, newUserEntry };
