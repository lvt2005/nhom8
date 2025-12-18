import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account_user",
      required: true
    },
    reported_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account_user"
    },
    reported_group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatGroup"
    },
    reason: {
      type: String,
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", schema, "reports");
export default Report;
