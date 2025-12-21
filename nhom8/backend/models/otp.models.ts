import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", schema, "otps");
export default OTP;
