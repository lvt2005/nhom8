import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const schema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    password: String,
    avatar: String,
    bio: String,
    slug: { type: String, slug: "fullName" },
    
    // --- CÁC TRƯỜNG TRẠNG THÁI (Đã thêm từ trước) ---
    isOnline: { type: Boolean, default: false },
    status: { type: String, default: "offline" },
    lastSeen: { type: Date, default: Date.now },

    // --- 🔥 CÁC TRƯỜNG MỚI CẦN THÊM CHO TÍNH NĂNG BẠN BÈ ---
    
    // 1. Danh sách bạn bè chính thức (Lưu ID của bạn bè)
    friendsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account_user"
      }
    ],

    // 2. Danh sách lời mời kết bạn ĐANG CHỜ (Người khác gửi cho mình)
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account_user"
      }
    ],

    // 3. Danh sách lời mời ĐÃ GỬI đi (Mình gửi cho người khác)
    sentRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account_user"
      }
    ],

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account_user"
      }
    ],

    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account_user"
      }
    ]
  }, 
  {
    timestamps: true,
  }
);

const account_user = mongoose.model("account_user", schema, "account_user");
export default account_user;