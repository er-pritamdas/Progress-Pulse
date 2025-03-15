import asynchandler from "../utils/asyncHandler.js";

const OTP_Generation = asynchandler(
    async (req, res, next) => {

        const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    }
) 

export default OTP_Generation