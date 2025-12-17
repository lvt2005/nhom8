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
    file_url: {
      type: String,
      default: null,
    },
    file_type: {
      type: String,
      enum: ['image', 'file', null],
      default: null,
    },
    file_name: {
      type: String,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deleted_for_me: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "account_user",
    }],
    deleted_for_everyone: {
      type: Boolean,
      default: false,
    },
    forwarded_from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat_history",
      default: null,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    pinned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account_user",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const chat_history = mongoose.model("chat_history", chatSchema, "chat_history");