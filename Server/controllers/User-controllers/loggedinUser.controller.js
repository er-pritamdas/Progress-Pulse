import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asynchandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import {ApiError} from  "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const isUserNamePresent = asynchandler(
    async (req,res,next) => {
        const {username,password} = req.body
        if(!username){
            throw new ApiError(400, "Username is required")
        }
        if(!password){
            throw new ApiError(400, "Password is required")
        }
        const userExist = await RegisteredUsers.findOne({username: username})
        if(!userExist){
            throw new ApiError(404, "User Not Found")  
        }
        req.user = userExist
        next()
    }
)

const isPasswordCorrect = asynchandler(
    async (req,res,next) => {
        const {password} = req.body
        const user = req.user

        const isMatch = await bcrypt.compare(password, user.passwordHash)

        if(!isMatch){
            throw new ApiError(401, "Password is incorrect")
        }

        user.lastLogin = Date.now()
        user.isLoggedIn = true
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        await user.save();
        return res.status(200).json(
            new ApiResponse(200, user, "User Logged In Successfully", token)
        )
    }
)

export {isUserNamePresent, isPasswordCorrect}



