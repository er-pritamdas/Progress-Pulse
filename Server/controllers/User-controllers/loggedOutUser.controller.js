import asynchandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const logoutUser = asynchandler(async (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  const user = await RegisteredUsers.findOne({ username: username });
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  user.isLoggedIn = false;
  user.lastLogout = Date.now();
  await user.save();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  return res.status(200).json(
    new ApiResponse(200,{username}," Logged Out Successfully")
);
});

export { logoutUser };
