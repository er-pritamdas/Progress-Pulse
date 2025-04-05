import asynchandler from "../../utils/asyncHandler";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import {ApiError} from  "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse";

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
        // const user = req.user
        if(password !== user.password){
            throw new ApiError(401, "Password is incorrect")
        }
        next()
        res.status(200) .jason(
            new ApiResponse(200, user, "User Logged In Successfully")
        )
    }
)

export {isUserNamePresent, isPasswordCorrect}



