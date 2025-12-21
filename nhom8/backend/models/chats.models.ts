import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sender_id: { 
      type: mongoose.Schema.Types.ObjectId, // Đổi từ String sang ObjectId
      ref: "account_user", // Tham chiếu để lấy tên/avatar người gửi
      required: true,
    },
    receiver_id: { 
      type: String, // Giữ String vì có thể là ID Group hoặc ID User
      required: true,
    },
    content: { 
      type: String,
      required: true,
    },
    room_chat_id: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, 
  }
);

const Chat = mongoose.model("Chat", chatSchema, "chats");
export default Chat;