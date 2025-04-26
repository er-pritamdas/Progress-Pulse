import asynchandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import bcrypt from "bcryptjs";




const isUserExist = asynchandler(
    async (req, res, next) => {
        const { email } = req.body
        if (!email) {
            throw new ApiError(400, "Email is required")
        }
        const userExist = await RegisteredUsers.findOne({ email: email })
        if (!userExist) {
            throw new ApiError(404, "User Not Found")
        }
        req.user = userExist
        next()
    }
)

const updateUserPassword = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    if (!email) {
        throw new ApiError(400, "Email requied");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await RegisteredUsers.findOneAndUpdate(
        { email },
        {
            $set: {
                passwordHash: encryptedPassword,
            }
        },
        { new: true }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Password reset successfully")
    );
});



export { isUserExist, updateUserPassword }