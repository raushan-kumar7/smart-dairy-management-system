import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../utils/GenerateAccessAndRefreshToken.js";
import crypto from "crypto";
import { getPasswordResetMailContent, sendMail } from "../utils/SendMail.js";
import { generateCode } from "../utils/GenerateCode.js";


const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const existedAdmin = await User.findOne({ email });

  if (existedAdmin) {
    throw new ApiError(400, "Admin already exists");
  }

  const userCode = await generateCode("admin");

  const admin = await User.create({
    email,
    password,
    role: "admin",
    userCode,
  });

  const createdAdmin = await User.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Admin not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdAdmin, "Admin created successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, userCode, password } = req.body;

  if (!(email || userCode)) {
    throw new ApiError(400, "Email or userCode is required");
  }

  const user = await User.findOne({ $or: [{ email }, { userCode }] });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { userCode, email } = req.body;
  const user = await User.findOne({ $or: [{ email }, { userCode }] });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  if (user?.role === "admin") {
    const mailContent = getPasswordResetMailContent("Admin", resetPasswordUrl);

    await sendMail({
      email: user.email,
      subject: "Password Reset Request",
      content: mailContent,
    });
  } else {
    const mailContent = getPasswordResetMailContent(
      user.firstName,
      resetPasswordUrl
    );

    await sendMail({
      email: user.email,
      subject: "Password Reset Request",
      content: mailContent,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { resetLink: resetPasswordUrl },
        "Password reset link sent to your email"
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successful"));
});

export { register, login, logout, changePassword, forgotPassword, resetPassword };
