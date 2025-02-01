import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { generateCode } from "../utils/GenerateCode.js";

const createAdmin = asyncHandler(async (req, res) => {
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

export { createAdmin };
