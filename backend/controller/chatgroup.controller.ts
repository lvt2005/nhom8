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

    // Tìm thành viên trong nhóm
    const memberIndex = group.users.findIndex((u: any) => u.user_id.toString() === myId.toString());
    if (memberIndex === -1) return res.json({ code: "error", Message: "Bạn không phải thành viên nhóm" });

    const leavingRole = group.users[memberIndex].role;

    // Nếu người rời là superAdmin
    if (leavingRole === 'superAdmin') {
      // Nếu chỉ có 1 thành viên (chính họ) -> giải tán nhóm
      if (group.users.length <= 1) {
        await ChatGroup.updateOne({ _id: groupId }, { deleted: true });
        return res.json({ code: "success", Message: "Bạn đã rời và nhóm đã bị giải tán" });
      }

      // Nếu còn thành viên khác, chuyển quyền superAdmin cho thành viên đầu tiên không phải người rời
      const newAdmin = group.users.find((u: any) => u.user_id.toString() !== myId.toString());
      if (newAdmin) {
        // Xóa người rời và cập nhật role của newAdmin
        await ChatGroup.updateOne(
          { _id: groupId },
          {
            $pull: { users: { user_id: myId } },
          }
        );
        await ChatGroup.updateOne(
          { _id: groupId, 'users.user_id': newAdmin.user_id },
          { $set: { 'users.$.role': 'superAdmin' } }
        );
        return res.json({ code: "success", Message: "Bạn đã rời nhóm. Quyền quản trị đã được chuyển." });
      }
    }

    // Thành viên bình thường rời nhóm
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

// API: Lấy thành viên nhóm (chỉ thành viên nhóm được xem)
export const getGroupMembers = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const groupId = req.params.groupId || req.query.groupId || req.body.groupId;

    const group = await ChatGroup.findOne({ _id: groupId, deleted: false }).populate(
      "users.user_id",
      "fullName avatar"
    );
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

    // Kiểm tra xem người gọi có phải thành viên
    const isMember = group.users.some((u: any) => u.user_id && u.user_id._id ? u.user_id._id.toString() === myId.toString() : u.user_id.toString() === myId.toString());
    if (!isMember) return res.json({ code: "error", Message: "Bạn không phải thành viên nhóm" });

    // Trả về danh sách thành viên đã populate
    res.json({ code: "success", data: group.users, Message: "Lấy thành viên nhóm thành công" });
  } catch (error) {
    console.error(error);
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

// API: Thêm thành viên vào nhóm (chỉ superAdmin)
export const addMember = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { groupId, userId } = req.body;

    const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

    const isAdmin = group.users.some((u: any) => u.user_id.toString() == myId.toString() && u.role === "superAdmin");
    if (!isAdmin) return res.json({ code: "error", Message: "Bạn không có quyền thêm thành viên" });

    const already = group.users.some((u: any) => u.user_id.toString() === userId.toString());
    if (already) return res.json({ code: "error", Message: "Thành viên đã có trong nhóm" });

    await ChatGroup.updateOne({ _id: groupId }, { $push: { users: { user_id: userId, role: "user" } } });

    const updated = await ChatGroup.findOne({ _id: groupId }).populate("users.user_id", "fullName avatar");
    res.json({ code: "success", data: updated, Message: "Thêm thành viên thành công" });
  } catch (error) {
    console.error(error);
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

// API: Kick thành viên khỏi nhóm (chỉ superAdmin)
export const kickMember = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { groupId, userId } = req.body;

    const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

    const isAdmin = group.users.some((u: any) => u.user_id.toString() == myId.toString() && u.role === "superAdmin");
    if (!isAdmin) return res.json({ code: "error", Message: "Bạn không có quyền kick thành viên" });

    // Tìm member để kick
    const target = group.users.find((u: any) => u.user_id.toString() === userId.toString());
    if (!target) return res.json({ code: "error", Message: "Thành viên không tồn tại trong nhóm" });

    // Không cho kick superAdmin
    if (target.role === "superAdmin") return res.json({ code: "error", Message: "Không thể kick superAdmin" });

    await ChatGroup.updateOne({ _id: groupId }, { $pull: { users: { user_id: userId } } });

    const updated = await ChatGroup.findOne({ _id: groupId }).populate("users.user_id", "fullName avatar");
    res.json({ code: "success", data: updated, Message: "Đã kick thành viên" });
  } catch (error) {
    console.error(error);
    res.json({ code: "error", Message: "Lỗi server" });
  }
};