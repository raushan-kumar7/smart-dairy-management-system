import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["admin", "farmer", "incharge", "sahayak"],
      required: true,
      lowercase: true,
    },
    userCode: {
      type: String,
    },
    firstName: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    lastName: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    fhFirstName: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    fhLastName: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    dob: {
      type: Date,
      required: function () {
        return this.role !== "admin";
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: function () {
        return this.role !== "admin";
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    avatar: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    address: {
      country: {
        type: String,
      },
      villageName: {
        type: String,
      },
      city: {
        type: String,
      },
      districtName: {
        type: String,
      },
      state: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },
    bankDetails: {
      bankName: {
        type: String,
      },
      accountHolderName: {
        type: String,
      },
      accountNumber: {
        type: String,
      },
      ifscCode: {
        type: String,
      },
    },
    mpcDetails: {
      bmcCode: {
        type: Number,
      },
      mppCode: {
        type: Number,
      },
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);