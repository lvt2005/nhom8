import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId, // 🔥 Bắt buộc đổi sang ObjectId
      ref: "account_user", // 🔥 Phải trỏ đúng tên model User của bạn
      required: true,
    },
    receiver_id: String,
    content: String,
    room_chat_id: String,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const chat_history = mongoose.model("chat_history", chatSchema, "chat_history");