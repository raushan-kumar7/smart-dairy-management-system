import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { BMC } from "../models/bmc.model.js";
import { MPP } from "../models/mpp.model.js";
import { MPC } from "../models/mpc.model.js";
import { logAudit } from "../utils/LogAudit.js"

// Generate a unique MPP Code
const generateMPPCode = async () => {
  const lastMPP = await MPP.findOne().sort({ mppCode: -1 });
  return lastMPP
    ? (parseInt(lastMPP.mppCode) + 1).toString().padStart(5, "0")
    : "05001";
};

const createMPP = asyncHandler(async (req, res) => {
  const { bmcCode, name, address } = req.body;

  if (!(bmcCode && name && address)) {
    throw new ApiError(400, "bmcCode, name, address are required");
  }

  const mppCode = await generateMPPCode();

  const mpp = await MPP.create({ bmcCode, name, mppCode, address });

  const createdMPP = await MPP.findById(mpp._id);

  if (!createdMPP) {
    throw new ApiError(500, "Something went wrong while creating MPP");
  }

  await BMC.findOneAndUpdate(
    { bmcCode },
    { $push: { mpps: mpp._id } },
    { upsert: true }
  );

  await MPC.findOneAndUpdate(
    {},
    { $push: { mpps: mpp._id } },
    { upsert: true }
  );

  logAudit(req, "CREATE", "MPP", "MPP created");

  return res
    .status(201)
    .json(new ApiResponse(201, createdMPP, "MPP created successfully"));
});

const getMPPs = asyncHandler(async (req, res) => {
  const mpps = await MPP.find();

  if (!mpps) {
    throw new ApiError(404, "MPPs not found");
  }

  logAudit(req, "RETRIEVE", "MPP", "Retrieved all MPPs");

  return res
    .status(200)
    .json(new ApiResponse(200, mpps, "MPPs retrieved successfully"));
});

const getMPP = asyncHandler(async (req, res) => {
  const { mppCode } = req.params;

  const mpp = await MPP.findOne({ mppCode });

  if (!mpp) {
    throw new ApiError(404, "MPP not found");
  }

  logAudit(req, "RETRIEVE", "MPP", "Retrieved MPP");

  return res
    .status(200)
    .json(new ApiResponse(200, mpp, "MPP retrieved successfully"));
});

const updateMPP = asyncHandler(async (req, res) => {
  const { mppCode } = req.params;
  const updates = req.body;
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  const updatedMPP = await MPP.findOneAndUpdate(
    { mppCode },
    { $set: updates },
    { new: true }
  );

  if (!updatedMPP) {
    throw new ApiError(500, "Something went wrong while updating MPP");
  }

  logAudit(req, "UPDATE", "MPP", "MPP updated");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMPP, "MPP updated successfully"));
});

const deleteMPP = asyncHandler(async (req, res) => {
  const { mppCode } = req.params;

  const deletedMPP = await MPP.findOneAndDelete({ mppCode });

  if (!deletedMPP) {
    throw new ApiError(500, "Something went wrong while deleting MPP");
  }

  await BMC.findOneAndUpdate(
    {
      mpps: deletedMPP._id,
    },
    {
      $pull: {
        mpps: deletedMPP._id,
      },
    }
  );

  await MPC.findOneAndUpdate(
    {
      mpps: deletedMPP._id,
    },
    {
      $pull: {
        mpps: deletedMPP._id,
      },
    }
  );

  logAudit(req, "DELETE", "MPP", "MPP deleted");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "MPP deleted successfully"));
});

export { createMPP, getMPPs, getMPP, updateMPP, deleteMPP };