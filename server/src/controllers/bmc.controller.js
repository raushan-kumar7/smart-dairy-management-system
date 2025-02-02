import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { BMC } from "../models/bmc.model.js";
import { MPC } from "../models/mpc.model.js";
import { createAuditLog } from "../utils/AuditLog.js";
import { getGeoLocation } from "../utils/GeoLocation.js";

// Generate a unique BMC Code
const generateBmcCode = async () => {
  const lastBMC = await BMC.findOne().sort({ bmcCode: -1 });
  return lastBMC
    ? (parseInt(lastBMC.bmcCode) + 1).toString().padStart(5, "0")
    : "02001";
};

// Create a new BMC
const createBmc = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can create BMC");
  }

  const { name, address, incharge } = req.body;
  const bmcCode = await generateBmcCode();
  const bmc = await BMC.create({ name, address, incharge, bmcCode });
  const createdBMC = await BMC.findById(bmc._id).populate("incharge");

  await MPC.findOneAndUpdate(
    {},
    { $push: { bmcs: bmc._id } },
    { upsert: true }
  );

  await createAuditLog({
    action: "CREATE",
    entity: "BMC",
    entityId: createdBMC._id,
    performedBy: req.user._id,
    newData: createdBMC,
    reason: "BMC created",
  });

  return res.status(201).json(new ApiResponse(201, createdBMC, "BMC created successfully"));
});

// Get all BMCs
const getBMCs = asyncHandler(async (req, res) => {
  const bmcs = await BMC.find().populate("incharge");

  await createAuditLog({
    action: "RETRIEVE",
    entity: "BMC",
    performedBy: req.user._id,
    reason: "Retrieved all BMCs",
  });

  return res.status(200).json(new ApiResponse(200, bmcs, "BMCs retrieved successfully"));
});

// Get a single BMC by bmcCode
const getBMC = asyncHandler(async (req, res) => {
  const { bmcCode } = req.params;
  const bmc = await BMC.findOne({ bmcCode }).populate("incharge");

  if (!bmc) {
    throw new ApiError(404, "BMC not found");
  }

  await createAuditLog({
    action: "RETRIEVE",
    entity: "BMC",
    entityId: bmc._id,
    performedBy: req.user._id,
    reason: "Retrieved a single BMC",
  });

  return res.status(200).json(new ApiResponse(200, bmc, "BMC retrieved successfully"));
});

// Update a BMC
const updateBMC = asyncHandler(async (req, res) => {
  const { bmcCode } = req.params;
  const updates = req.body;
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  const updatedBMC = await BMC.findOneAndUpdate(
    { bmcCode },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("incharge");

  if (!updatedBMC) {
    throw new ApiError(404, "BMC not found");
  }

  await createAuditLog({
    action: "UPDATE",
    entity: "BMC",
    entityId: updatedBMC._id,
    performedBy: req.user._id,
    newData: updatedBMC,
    reason: "BMC updated",
  });

  return res.status(200).json(new ApiResponse(200, updatedBMC, "BMC updated successfully"));
});

// Delete a BMC
const deleteBMC = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can delete BMC");
  }

  const { bmcCode } = req.params;
  const deletedBMC = await BMC.findOneAndDelete({ bmcCode });

  if (!deletedBMC) {
    throw new ApiError(404, "BMC not found");
  }

  await MPC.findOneAndUpdate(
    { bmcs: deletedBMC._id },
    { $pull: { bmcs: deletedBMC._id } }
  );

  await createAuditLog({
    action: "DELETE",
    entity: "BMC",
    entityId: deletedBMC._id,
    performedBy: req.user._id,
    reason: "BMC deleted",
  });

  return res.status(200).json(new ApiResponse(200, {}, "BMC deleted successfully"));
});

export { createBmc, getBMCs, getBMC, updateBMC, deleteBMC };