import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthcheck = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, "Healthcheck is OK"));
});

export { healthcheck };