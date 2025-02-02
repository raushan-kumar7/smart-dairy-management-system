import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { MPC } from "../models/mpc.model.js";
import { logAudit } from "../utils/LogAudit.js"

const getMPCsDetails = asyncHandler(async (req, res) => {
  const mpcDetails = await MPC.find()
    .populate({ path: "bmcs", select: "name bmcCode address incharge -_id" })
    .populate({ path: "mpps", select: "name mppCode address sahayak -_id" })
    .populate({ path: "farmers", select: "name farmerCode -_id" })
    .populate({ path: "sahayaks", select: "name sahayakCode -_id" })
    .populate({ path: "staffs", select: "name staffCode -_id" })
    .select("-_id -__v");

  if (!mpcDetails || mpcDetails.length === 0) {
    throw new ApiError(404, "MPC details not found");
  }

  await logAudit(req, "RETRIEVE", "MPC", "Retrieved MPC details");

  return res
    .status(200)
    .json(
      new ApiResponse(200, mpcDetails, "MPC details retrieved successfully")
    );
});

const getMPCCounts = asyncHandler(async (req, res) => {
  const counts = await MPC.aggregate([
    {
      $project: {
        totalBMCs: { $size: "$bmcs" },
        totalMPPs: { $size: "$mpps" },
        totalFarmers: { $size: "$farmers" },
        totalSahayaks: { $size: "$sahayaks" },
        totalStaffs: { $size: "$staffs" },
      },
    },
    {
      $group: {
        _id: null,
        totalBMCs: { $sum: "$totalBMCs" },
        totalMPPs: { $sum: "$totalMPPs" },
        totalFarmers: { $sum: "$totalFarmers" },
        totalSahayaks: { $sum: "$totalSahayaks" },
        totalStaffs: { $sum: "$totalStaffs" },
      },
    },
  ]);

  if (!counts || counts.length === 0) {
    throw new ApiError(404, "MPC data not found");
  }

  logAudit(req, "RETRIEVE", "MPC", "Retrieved MPC counts");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { counts, auditLog: createdAuditLog },
        "MPC counts retrieved successfully"
      )
    );
});

export { getMPCsDetails, getMPCCounts };
