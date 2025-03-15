
import asynchandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import mongoose from "mongoose";
import {ApiError} from "../../utils/ApiError.js";
import {ApiResponse} from "../../utils/ApiResponse.js"



const isUserPresent = asynchandler(
    async(req,res,next) => {
        const {username, email, password, phoneNumber} = req.body

        if(!username){
            throw new ApiError(400, "please enter username")
        }
        if(!email){
            throw new ApiError(201, "please enter email")
        }
        if(!password){
            throw new ApiError(400, "please enter password")
        }
        if(!phoneNumber){
            throw new ApiError(400, "please enter phonenumber")
        }


        const userExist = await RegisteredUsers.findOne({username: username})
        if(userExist){
            throw new ApiError(400, "User Already Present")
        }

        next()

    }
)

const newUserEntry = asynchandler(
    async (req, res, next) => {
        const {username, email, password, phoneNumber} = req.body
        const createUser = await RegisteredUsers.create(
            {
                username: username,
                email: email,
                passwordHash: password,
                phoneNumber: phoneNumber
            }
        )

        return res.status(201).json(
            new ApiResponse(200, createUser, "User Registered successfully")
        )
    }
)

export {isUserPresent, newUserEntry}