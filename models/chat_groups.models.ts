import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: String,
    avatar: String,
    type: {
      type: String,
      default: "room-chat"
    },
    status: {
      type: String,
      default: "active"
    },
    users: [
      {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            // 🔥 QUAN TRỌNG: Phải khớp với tên model trong file account_user.models.ts
            ref: "account_user" 
        },
        role: {
          type: String,
          default: "user"
        }
      }
    ],
    deleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  {
    timestamps: true,
  }
);

const ChatGroup = mongoose.model("ChatGroup", schema, "chat-groups");
export default ChatGroup;