import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

const generateCode = async (role) => {
  try {
    const prefix = role.charAt(0).toUpperCase();

    const lastUser = await User.findOne({ 
      role, 
      userCode: { $regex: `^${prefix}\\d{3}$` }
    }).sort({ userCode: -1 }).limit(1);

    let nextNumber = 1;

    if (lastUser) {
      const lastCode = lastUser.userCode.slice(1);

      if (!isNaN(lastCode)) {
        nextNumber = parseInt(lastCode, 10) + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
  } catch {
    throw new ApiError(500, "Error generating user code");
  }
};

export { generateCode };