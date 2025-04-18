
import bcrypt from "bcryptjs";
import asyncHandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import {ApiError} from "../../utils/ApiError.js";
import {ApiResponse} from "../../utils/ApiResponse.js"
// import mongoose from "mongoose";



const isUserPresent = asyncHandler(
    async(req,res,next) => {
        const {username, email, password} = req.body

        if(!username){
            throw new ApiError(400, "Username is required")
        }
        if(!email){
            throw new ApiError(201, "Email is required")
        }
        if(!password){
            throw new ApiError(400, "Password is required")
        }

        const userExist = await RegisteredUsers.findOne({username: username})
        if(userExist){
            throw new ApiError(409, "User Already Present")
        }

        next()

    }
)

const newUserEntry = asyncHandler(
    async (req, res, next) => {
        const {username, email, password} = req.body

        const encryptPassword = await bcrypt.hash(password, 10)

        try{

            const createUser = await RegisteredUsers.create(
                {
                    username: username,
                    email: email,
                    passwordHash: encryptPassword,
                }
            )
    
            next()
            return res.status(201).json(
                new ApiResponse(201, createUser, "User Registered successfully")
            )
            

        }catch(error){
            throw new ApiError(409, error.message)
        }
        
    }
)

export {isUserPresent, newUserEntry}