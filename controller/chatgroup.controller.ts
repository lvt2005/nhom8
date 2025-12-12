import ChatGroup from "../models/chat_groups.models";
import { Request, Response } from "express";

// API: Tạo nhóm chat mới (kèm thành viên)
export const createGroup = async (req: any, res: Response) => {
  try {
    const myId = req.account._id; // Lấy ID người tạo
    const { title, userIds } = req.body; // userIds là mảng chứa id bạn bè được chọn

    // Tạo danh sách thành viên ban đầu (bao gồm người tạo là Admin)
    const members = [
      {
        user_id: myId,
        role: "superAdmin"
      }
    ];

    // Nếu có danh sách bạn bè được gửi lên, thêm họ vào nhóm
    if (userIds && Array.isArray(userIds)) {
      userIds.forEach((friendId: string) => {
        // Chỉ thêm nếu ID khác ID người tạo (tránh trùng lặp)
        if (friendId !== myId.toString()) {
          members.push({
            user_id: friendId,
            role: "user" // Thành viên bình thường
          });
        }
      });
    }

    const newGroup = new ChatGroup({
      title: title,
      type: "room-chat",
      users: members
    });

    await newGroup.save();

    res.json({
      code: "success",
      Message: "Tạo nhóm thành công",
      data: newGroup
    });
  } catch (error) {
    console.error(error);
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

// API: Lấy danh sách nhóm chat của mình
export const getListGroups = async (req: any, res: Response) => {
    try {
        const myId = req.account._id;
        const groups = await ChatGroup.find({
            "users.user_id": myId,
            deleted: false,
            type: "room-chat"
        })
        .sort({ createdAt: -1 }) // Nhóm mới nhất lên đầu
        // 🔥 populate vào bên trong mảng users -> user_id để lấy fullName và avatar
        // Lệnh này giờ sẽ CHẠY ĐÚNG vì ref bên model đã sửa thành "account_user"
        .populate("users.user_id", "fullName avatar"); 
        
        res.json({
            code: "success",
            data: groups,
            Message: "Lấy danh sách nhóm thành công"
        });
    } catch (error) {
        console.log(error);
        res.json({ code: "error", Message: "Lỗi server" });
    }
}

// API: Rời nhóm
export const leaveGroup = async (req: any, res: Response) => {
    try {
        const myId = req.account._id;
        const { groupId } = req.body;

        const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
        if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

        await ChatGroup.updateOne(
            { _id: groupId },
            { $pull: { users: { user_id: myId } } }
        );

        res.json({ code: "success", Message: "Đã rời nhóm thành công" });
    } catch (error) {
        res.json({ code: "error", Message: "Lỗi server" });
    }
};

// API: Xóa nhóm (Chỉ Admin)
export const deleteGroup = async (req: any, res: Response) => {
    try {
        const myId = req.account._id;
        const { groupId } = req.body;

        const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
        if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

        // Check quyền Super Admin
        // Lưu ý: u.user_id có thể là object hoặc string tùy vào lúc lấy dữ liệu
        // Nên dùng toString() để so sánh cho chắc chắn
        const isAdmin = group.users.some((u: any) => u.user_id.toString() == myId.toString() && u.role === "superAdmin");
        
        if (!isAdmin) {
            return res.json({ code: "error", Message: "Bạn không có quyền xóa nhóm này" });
        }

        await ChatGroup.updateOne({ _id: groupId }, { deleted: true });

        res.json({ code: "success", Message: "Đã giải tán nhóm" });
    } catch (error) {
        res.json({ code: "error", Message: "Lỗi server" });
    }
};