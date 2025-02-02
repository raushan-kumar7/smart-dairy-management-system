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
        ref: "Farmer",
      },
    ],
    staffs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Staff",
      },
    ],
  },
  { timestamps: true }
);

export const MPC = mongoose.model("MPC", mpcSchema);
