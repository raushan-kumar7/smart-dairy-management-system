import mongoose, { Schema } from "mongoose";

const mpcSchema = new Schema(
  {
    bmcs: [
      {
        type: Schema.Types.ObjectId,
        ref: "BMC",
      },
    ],
    mpps: [
      {
        type: Schema.Types.ObjectId,
        ref: "MPP",
      },
    ],
    farmers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sahayaks: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    staffs: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const MPC = mongoose.model("MPC", mpcSchema);
