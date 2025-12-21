import { Response } from "express";
import multer from "multer";
import ChatGroup from "../models/chat_groups.models";
import storage from "../helpers/mlterCloudinary.helper";

export const upload = multer({ storage });

export const uploadGroupAvatar = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const groupId = req.body.groupId;

    if (!groupId) return res.json({ code: "error", Message: "Thiếu groupId" });
    if (!req.file) return res.json({ code: "error", Message: "Thiếu file" });

    const group = await ChatGroup.findOne({ _id: groupId, deleted: false });
    if (!group) return res.json({ code: "error", Message: "Nhóm không tồn tại" });

    const isAdmin = group.users.some((u: any) => u.user_id.toString() === myId.toString() && u.role === "superAdmin");
    if (!isAdmin) return res.json({ code: "error", Message: "Bạn không có quyền" });

    const url = (req.file as any).path || (req.file as any).secure_url;
    await ChatGroup.updateOne({ _id: groupId }, { avatar: url });

    res.json({ code: "success", Message: "Cập nhật ảnh nhóm thành công", data: { avatar: url } });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};
