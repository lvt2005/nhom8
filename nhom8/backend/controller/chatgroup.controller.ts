import ChatGroup from "../models/chat_groups.models";
import { Request, Response } from "express";

export const createGroup = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { title, userIds } = req.body;

    const members = [{ user_id: myId, role: "superAdmin" }];

    if (userIds && Array.isArray(userIds)) {
      userIds.forEach((friendId: string) => {
        if (friendId !== myId.toString()) {
          members.push({ user_id: friendId, role: "user" });
        }
      });
    }

    const newGroup = new ChatGroup({ title, type: "room-chat", users: members });
    await newGroup.save();

    res.json({ code: "success", Message: "Tạo nhóm thành công", data: newGroup });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

export const updateBackground = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { groupId, background } = req.body;
    const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });
    const isAdmin = group.users.some((u: any) => u.user_id.toString() === myId.toString() && u.role === "superAdmin");
    if (!isAdmin) return res.json({ code: "error", Message: "Không có quyền" });
    await ChatGroup.updateOne({ _id: groupId }, { background });
    if ((global as any)._io) {
      (global as any)._io.emit("SERVER_GROUP_BACKGROUND_CHANGED", { groupId, background });
    }
    res.json({ code: "success", Message: "Đã cập nhật", background });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

export const updateQuickEmoji = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { groupId, quickEmoji } = req.body;
    const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });
    const isMember = group.users.some((u: any) => u.user_id.toString() === myId.toString());
    if (!isMember) return res.json({ code: "error", Message: "Không phải thành viên" });
    await ChatGroup.updateOne({ _id: groupId }, { quickEmoji });
    if ((global as any)._io) {
      (global as any)._io.emit("SERVER_GROUP_EMOJI_CHANGED", { groupId, quickEmoji });
    }
    res.json({ code: "success", Message: "Đã cập nhật", quickEmoji });
  } catch (error) {
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
    const { groupId, transferToUserId } = req.body;

        const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
        if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

    // Tìm thành viên trong nhóm
    const memberIndex = group.users.findIndex((u: any) => u.user_id.toString() === myId.toString());
    if (memberIndex === -1) return res.json({ code: "error", Message: "Bạn không phải thành viên nhóm" });

    const leavingRole = group.users[memberIndex].role;

    if (leavingRole === 'superAdmin') {
      if (group.users.length <= 1) {
        await ChatGroup.updateOne({ _id: groupId }, { deleted: true });
        return res.json({ code: "success", Message: "Nhóm đã bị giải tán" });
      }

      if (!transferToUserId) {
        return res.json({ code: "error", Message: "Trưởng nhóm cần chuyển quyền trước khi rời nhóm", reason: "need_transfer" });
      }

      const target = group.users.find((u: any) => u.user_id.toString() === transferToUserId.toString());
      if (!target) return res.json({ code: "error", Message: "Thành viên nhận quyền không tồn tại" });
      if (transferToUserId.toString() === myId.toString()) return res.json({ code: "error", Message: "Không thể tự chuyển quyền cho chính mình" });

      await ChatGroup.updateOne(
        { _id: groupId, "users.user_id": myId },
        { $set: { "users.$.role": "user" } }
      );
      await ChatGroup.updateOne(
        { _id: groupId, "users.user_id": transferToUserId },
        { $set: { "users.$.role": "superAdmin" } }
      );

      await ChatGroup.updateOne(
        { _id: groupId },
        { $pull: { users: { user_id: myId } } }
      );

      return res.json({ code: "success", Message: "Đã chuyển quyền và rời nhóm" });
    }

    await ChatGroup.updateOne(
      { _id: groupId },
      { $pull: { users: { user_id: myId } } }
    );

    const leader = group.users.find((u: any) => u.role === 'superAdmin');
    const leaderId = leader?.user_id?.toString();
    if (leaderId && (global as any)._io) {
      (global as any)._io.to(`user:${leaderId}`).emit("SERVER_GROUP_MEMBER_LEFT", {
        groupId,
        userId: myId,
      });
    }

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

// API: Thêm nhiều thành viên vào nhóm (chỉ superAdmin)
export const addMembers = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { groupId, userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.json({ code: "error", Message: "Danh sách thành viên không hợp lệ" });
    }

    const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

    const isAdmin = group.users.some((u: any) => u.user_id.toString() == myId.toString() && u.role === "superAdmin");
    if (!isAdmin) return res.json({ code: "error", Message: "Bạn không có quyền thêm thành viên" });

    const existing = new Set(group.users.map((u: any) => u.user_id.toString()));
    const toAdd = userIds
      .map((id: any) => id?.toString?.() ? id.toString() : String(id))
      .filter((id: string) => id && !existing.has(id));

    if (toAdd.length === 0) {
      return res.json({ code: "success", Message: "Không có thành viên mới để thêm" });
    }

    await ChatGroup.updateOne(
      { _id: groupId },
      { $push: { users: { $each: toAdd.map((id: string) => ({ user_id: id, role: "user" })) } } }
    );

    const updated = await ChatGroup.findOne({ _id: groupId }).populate("users.user_id", "fullName avatar");
    res.json({ code: "success", data: updated, Message: "Thêm thành viên thành công" });
  } catch (error) {
    console.error(error);
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

// API: Chuyển quyền trưởng nhóm (chỉ superAdmin)
export const transferAdmin = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { groupId, newAdminId } = req.body;

    const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

    const isAdmin = group.users.some((u: any) => u.user_id.toString() == myId.toString() && u.role === "superAdmin");
    if (!isAdmin) return res.json({ code: "error", Message: "Bạn không có quyền chuyển trưởng nhóm" });

    if (!newAdminId) return res.json({ code: "error", Message: "Thiếu người nhận quyền" });
    if (newAdminId.toString() === myId.toString()) return res.json({ code: "error", Message: "Không thể tự chuyển quyền cho chính mình" });

    const target = group.users.find((u: any) => u.user_id.toString() === newAdminId.toString());
    if (!target) return res.json({ code: "error", Message: "Thành viên nhận quyền không tồn tại" });

    await ChatGroup.updateOne(
      { _id: groupId, "users.user_id": myId },
      { $set: { "users.$.role": "user" } }
    );
    await ChatGroup.updateOne(
      { _id: groupId, "users.user_id": newAdminId },
      { $set: { "users.$.role": "superAdmin" } }
    );

    const updated = await ChatGroup.findOne({ _id: groupId }).populate("users.user_id", "fullName avatar");
    res.json({ code: "success", data: updated, Message: "Đã chuyển trưởng nhóm" });
  } catch (error) {
    console.error(error);
    res.json({ code: "error", Message: "Lỗi server" });
  }
};