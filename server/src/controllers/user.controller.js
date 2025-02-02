import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { generateCode } from "../utils/GenerateCode.js";
import { MPC } from "../models/mpc.model.js";
import { getGeoLocation } from "../utils/GeoLocation.js";
import { createAuditLog } from "../utils/AuditLog.js";

const generateUserCode = async (role) => {
  const code = await generateCode(role);
  return code;
};

const createUser = asyncHandler(async (req, res) => {
  const {
    role,
    firstName,
    lastName,
    fhFirstName,
    fhLastName,
    dob,
    gender,
    email,
    password,
    phone,
  } = req.body;

  if (
    [
      role,
      firstName,
      lastName,
      fhFirstName,
      fhLastName,
      dob,
      gender,
      email,
      password,
      phone,
    ].some((f) => f.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const validRoles = ["farmer", "sahayak", "incharge"];
  if (!validRoles.includes(role)) {
    throw new ApiError(
      400,
      "Invalid role. You can only create farmer, sahayak, or incharge accounts"
    );
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, `User with this email - ${email} already exists`);
  }

  const userCode = await generateUserCode(role);

  const userData = {
    role,
    userCode,
    firstName,
    lastName,
    fhFirstName,
    fhLastName,
    dob,
    gender,
    email: email.toLowerCase(),
    password,
    phone,
  };

  const user = await User.create(userData);

  if (role === "farmer") {
    await MPC.findOneAndUpdate(
      {},
      { $push: { farmers: user._id } },
      { upsert: true }
    );
  } else if (role === "sahayak") {
    await MPC.findOneAndUpdate(
      {},
      { $push: { sahayaks: user._id } },
      { upsert: true }
    );
  } else if (role === "incharge") {
    await MPC.findOneAndUpdate(
      {},
      { $push: { staffs: user._id } },
      { upsert: true }
    );
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const geo = await getGeoLocation(ip);

  await createAuditLog({
    action: "CREATE",
    entity: "USER",
    entityId: user._id,
    performedBy: user._id,
    newData: user,
    reason: "User created",
    metadata: {
      ...geo,
      deviveInfo: req.headers["user-agent"],
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const geo = await getGeoLocation(ip);

  await createAuditLog({
    action: "UPDATE",
    entity: "USER",
    entityId: user._id,
    performedBy: user._id,
    newData: user,
    reason: "User updated",
    metadata: {
      ...geo,
      deviveInfo: req.headers["user-agent"],
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const geo = await getGeoLocation(ip);

  await createAuditLog({
    action: "RETRIEVE",
    entity: "USER",
    entityId: req.user._id,
    performedBy: req.user._id,
    reason: "Retrieved current user",
    metadata: {
      ...geo,
      deviveInfo: req.headers["user-agent"],
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User found successfully"));
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user?._id);

  if (!user) {
    throw new ApiError(500, "Something went wrong while deleting user");
  }

  if (user.role === "farmer") {
    await MPC.findOneAndUpdate(
      {},
      { $pull: { farmers: user._id } },
      { upsert: true }
    );
  } else if (user.role === "sahayak") {
    await MPC.findOneAndUpdate(
      {},
      { $pull: { sahayaks: user._id } },
      { upsert: true }
    );
  } else if (user.role === "incharge") {
    await MPC.findOneAndUpdate(
      {},
      { $pull: { staffs: user._id } },
      { upsert: true }
    );
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const geo = await getGeoLocation(ip);

  await createAuditLog({
    action: "DELETE",
    entity: "USER",
    entityId: user._id,
    performedBy: user._id,
    reason: "User deleted",
    metadata: {
      ...geo,
      deviveInfo: req.headers["user-agent"],
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export { createUser, updateUser, getCurrentUser, deleteUserAccount };