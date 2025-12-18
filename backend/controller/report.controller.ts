import { Response } from "express";
import Report from "../models/report.models";

export const createReport = async (req: any, res: Response) => {
  try {
    const myId = req.account._id;
    const { reported_user_id, reported_group_id, reason, description } = req.body;

    if (!reason) {
      return res.json({ code: "error", Message: "Vui lòng chọn lý do báo cáo" });
    }

    const report = new Report({
      reporter_id: myId,
      reported_user_id: reported_user_id || null,
      reported_group_id: reported_group_id || null,
      reason,
      description
    });

    await report.save();
    res.json({ code: "success", Message: "Đã gửi báo cáo" });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};
