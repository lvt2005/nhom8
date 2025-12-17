import { NextFunction, Request, Response } from "express";
import account_user from "../models/account_user.models";
import { RequestAccount } from "../interfaces/reqAccount.interface";
import bcrypt from "bcrypt";

export const infoUser = async (req: any, res: Response) => {
    const user = req.account; 

    res.json({
        code: "success",
        Message: "Lấy thông tin thành công!",
        data: user
    });
};
export const getListUser = async (req: any, res: Response) => {
    try {
        // Lấy ID của mình từ req.account
        const myId = req.account._id || req.account.id; 

        const users = await account_user.find({
            _id: { $ne: myId } // Tìm user KHÁC ID của mình
        }).select("-password"); // Bỏ mật khẩu ra

        res.json({
            code: "success",
            Message: "Lấy danh sách bạn bè thành công!",
            data: users
        });
    } catch (error) {
        res.json({ 
            code: "error", 
            Message: "Lỗi lấy danh sách",
            error: error
        });
    }
};
export const infoUserPut = async (req: RequestAccount, res: Response, next: NextFunction) => {
  try {
    const user = req.account._id
    const extisEmail = await account_user.findOne({
      _id: user,
      email: req.body.email
    })
    if (extisEmail) {
      res.json({  
        code: "error",
        Message: "Email đã tồn tại trong hệ thống!"
      })
      return;
    }
    const extisPhone = await account_user.findOne({
      _id: { $ne: user },
      phone: req.body.phone
    })
    if (extisPhone) {
      res.json({
        code: "error",
        Message: "Số điện thoại đã tồn tại trong hệ thống!"
      })
      return;
    }
    if (req.file) {
      req.body.avatar = req.file.path
    }
    else {
      delete req.body.logo
    }
    await account_user.updateOne({
      _id: user
    }, req.body)
    res.json({
      code: "success",
      Message: "Cập nhật thành công"
    })
  } catch (error) {
    res.json({
      code: "error",
      Message: "Lỗi"
    })
  
}
}
export const changeStatus = async (req: RequestAccount, res: Response) => {
  try {
    const id = req.account._id; // Lấy ID user từ middleware auth
    const { status } = req.body; // Client gửi lên: "online" hoặc "offline"

    // 1. Cập nhật vào Database
    await account_user.updateOne(
      { _id: id },
      {
        status: status, // Lưu chuỗi "online"/"offline" để hiện chữ
        isOnline: status === "online" // Lưu boolean để hiện chấm xanh
      }
    );

    // 2. QUAN TRỌNG: Bắn Socket báo cho tất cả bạn bè biết (Real-time)
    // Lưu ý: Biến _io hoặc global.io phải được khai báo ở file index.ts
    // Nếu bạn không có biến global, hãy đảm bảo logic socket nằm ở file socket riêng
    _io.emit("SERVER_RETURN_USER_STATUS", {
        userId: id,
        status: status,
        isOnline: status === "online"
    });

    res.json({
      code: "success",
      Message: "Cập nhật trạng thái thành công"
    });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", Message: "Lỗi server" });
  }
};
export const searchUser = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    // Tìm user có phone trùng khớp (bỏ qua chính mình nếu cần)
    const user = await account_user.findOne({ 
        phone: phone, 
    }).select("fullName avatar phone _id"); // Chỉ lấy thông tin cần thiết

    if (!user) {
      return res.json({ code: "error", Message: "Không tìm thấy người dùng với số điện thoại này." });
    }

    res.json({
      code: "success",
      data: user,
      Message: "Tìm thấy người dùng"
    });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};
// Lấy danh sách bạn bè đã kết bạn
export const getFriendsList = async (req: RequestAccount, res: Response) => {
  try {
    const myId = req.account._id;
    // Tìm user hiện tại và populate mảng friendsList
    const user = await account_user.findById(myId).populate('friendsList', 'fullName avatar email phone status isOnline');
    
    if (!user) return res.json({ code: "error", Message: "User not found" });

    res.json({
      code: "success",
      data: user.friendsList, // Trả về mảng bạn bè
      Message: "Lấy danh sách bạn bè thành công"
    });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

// Gửi lời mời kết bạn
export const requestFriend = async (req: RequestAccount, res: Response) => {
  try {
    const myId = req.account._id; // Đây thường là ObjectId
    const { friendId } = req.body; // Đây là String

    // 0. CHECK LOGIC: KHÔNG ĐƯỢC TỰ KẾT BẠN VỚI CHÍNH MÌNH (Mới thêm)
    // Chuyển myId sang string để so sánh chính xác
    if (myId.toString() === friendId) {
        return res.json({ 
            code: "error", 
            Message: "Bạn không thể gửi lời mời kết bạn cho chính mình!" 
        });
    }

    // 1. Lấy thông tin bản thân
    const me = await account_user.findById(myId);

    // Kiểm tra user có tồn tại không
    if (!me) {
        return res.json({ code: "error", Message: "Tài khoản của bạn không tồn tại!" });
    }

    // 2. KIỂM TRA ĐÃ KẾT BẠN CHƯA
    const isFriend = me.friendsList.some(id => id.toString() === friendId);
    if (isFriend) {
        return res.json({ code: "error", Message: "Hai người đã là bạn bè rồi!" });
    }

    // 3. KIỂM TRA ĐÃ GỬI LỜI MỜI TRƯỚC ĐÓ CHƯA
    const isSent = me.sentRequests.some(id => id.toString() === friendId);
    if (isSent) {
        return res.json({ code: "error", Message: "Bạn đã gửi lời mời rồi, vui lòng chờ đồng ý!" });
    }

    // 4. KIỂM TRA NGƯỜI KIA CÓ GỬI CHO MÌNH KHÔNG
    const isReceived = me.friendRequests.some(id => id.toString() === friendId);
    if (isReceived) {
         return res.json({ code: "error", Message: "Người này đã gửi lời mời cho bạn. Hãy kiểm tra danh sách lời mời!" });
    }

    // 5. CẬP NHẬT DATABASE
    // Thêm vào danh sách "Lời mời nhận được" của người kia
    await account_user.updateOne(
        { _id: friendId },
        { $addToSet: { friendRequests: myId } } 
    );
    
    // Thêm vào danh sách "Lời mời đã gửi" của mình
    await account_user.updateOne(
        { _id: myId },
        { $addToSet: { sentRequests: friendId } }
    );

    // 6. GỬI SOCKET REAL-TIME
    if ((global as any)._io) {
        (global as any)._io.emit("SERVER_SEND_FRIEND_REQUEST", { 
            toUserId: friendId, 
            fromUser: { 
                _id: me._id, 
                fullName: me.fullName, 
                avatar: me.avatar 
            } 
        });
    }

    res.json({ code: "success", Message: "Đã gửi lời mời kết bạn!" });

  } catch (error) {
    console.error("Lỗi requestFriend:", error);
    res.json({ code: "error", Message: "Lỗi kết bạn" });
  }
};

// Chấp nhận kết bạn (MỚI)
export const acceptFriend = async (req: RequestAccount, res: Response) => {
    try {
        const myId = req.account._id;
        const { userId } = req.body; // ID người mình muốn đồng ý

        // 1. Thêm nhau vào friendsList
        await account_user.updateOne({ _id: myId }, { 
            $push: { friendsList: userId },
            $pull: { friendRequests: userId } // Xóa khỏi danh sách chờ
        });
        
        await account_user.updateOne({ _id: userId }, { 
            $push: { friendsList: myId },
            $pull: { sentRequests: myId }
        });

        // 2. Bắn socket để cả 2 cập nhật danh sách bạn bè ngay lập tức
        (global as any)._io.emit("SERVER_FRIEND_ACCEPTED", { userA: myId, userB: userId });

        res.json({ code: "success", Message: "Đã trở thành bạn bè" });
    } catch (error) {
        res.json({ code: "error", Message: "Lỗi server" });
    }
}

export const getFriendRequests = async (req: RequestAccount, res: Response) => {
  try {
    const myId = req.account._id;
    // Populate để lấy thông tin chi tiết của người gửi
    const user = await account_user.findById(myId)
        .populate('friendRequests', 'fullName avatar email _id'); // Chỉ lấy info cần thiết

    if (!user) return res.json({ code: "error", Message: "User not found" });

    res.json({
      code: "success",
      data: user.friendRequests, 
      Message: "Lấy danh sách lời mời thành công"
    });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

// Xóa bạn bè
export const removeFriend = async (req: RequestAccount, res: Response) => {
    try {
        const myId = req.account._id;
        const { friendId } = req.body;

        // Xóa ID của nhau trong friendsList
        await account_user.updateOne({ _id: myId }, { $pull: { friendsList: friendId } });
        await account_user.updateOne({ _id: friendId }, { $pull: { friendsList: myId } });

        // Bắn socket để cập nhật frontend ngay lập tức
        if ((global as any)._io) {
            (global as any)._io.emit("SERVER_FRIEND_REMOVED", { userA: myId, userB: friendId });
        }

        res.json({ code: "success", Message: "Đã xóa bạn bè" });
    } catch (error) {
        res.json({ code: "error", Message: "Lỗi server" });
    }
};

// Từ chối lời mời kết bạn
export const declineFriendRequest = async (req: RequestAccount, res: Response) => {
    try {
        const myId = req.account._id;
        const { userId } = req.body; // Người gửi lời mời mà mình muốn từ chối

        // Xóa khỏi danh sách chờ của mình
        await account_user.updateOne({ _id: myId }, { $pull: { friendRequests: userId } });
        // Xóa khỏi danh sách đã gửi của họ
        await account_user.updateOne({ _id: userId }, { $pull: { sentRequests: myId } });

        res.json({ code: "success", Message: "Đã từ chối lời mời" });
    } catch (error) {
        res.json({ code: "error", Message: "Lỗi server" });
    }
};

// Đổi mật khẩu
export const changePassword = async (req: RequestAccount, res: Response) => {
    try {
        const myId = req.account._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.json({ code: "error", Message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        // Lấy thông tin user
        const user = await account_user.findById(myId);
        if (!user) {
            return res.json({ code: "error", Message: "Người dùng không tồn tại!" });
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordCorrect = bcrypt.compareSync(currentPassword, `${user.password}`);
        if (!isPasswordCorrect) {
            return res.json({ code: "error", Message: "Mật khẩu hiện tại không đúng!" });
        }

        // Validate mật khẩu mới
        if (newPassword.length < 8) {
            return res.json({ code: "error", Message: "Mật khẩu mới phải có ít nhất 8 ký tự!" });
        }

        // Hash mật khẩu mới
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Cập nhật mật khẩu
        await account_user.updateOne(
            { _id: myId },
            { password: hashedPassword }
        );

        res.json({ code: "success", Message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi changePassword:", error);
        res.json({ code: "error", Message: "Lỗi server" });
    }
};