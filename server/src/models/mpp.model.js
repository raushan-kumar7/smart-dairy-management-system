import mongoose, { Schema } from "mongoose";

const mppSchema = new Schema(
  {
    bmcCode: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      country: {
        type: String,
      },
      state: {
        type: String,
      },
      districtName: {
        type: String,
      },
      city: {
        type: String,
      },
      villageName: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },
    mppCode: {
      type: Number,
    },
    sahayak: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    farmers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const MPP = mongoose.model("MPP", mppSchema);