import { Request, Response } from "express";
import account_user from "../models/account_user.models";
import OTP from "../models/otp.models";
import { sendOTPEmail } from "../helpers/mailer.helper";
import bcrypt from "bcrypt";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ code: "error", Message: "Vui lòng nhập email" });
    }

    const user = await account_user.findOne({ email });
    if (!user) {
      return res.json({ code: "error", Message: "Email không tồn tại trong hệ thống" });
    }

    await OTP.deleteMany({ email, used: false });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({ email, otp, expiresAt });
    await sendOTPEmail(email, otp);

    res.json({ code: "success", Message: "Đã gửi mã OTP về email" });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.json({ code: "error", Message: "Thiếu thông tin" });
    }

    const otpRecord = await OTP.findOne({ email, otp, used: false, expiresAt: { $gt: new Date() } });
    if (!otpRecord) {
      return res.json({ code: "error", Message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    otpRecord.used = true;
    await otpRecord.save();

    res.json({ code: "success", Message: "Xác thực thành công" });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.json({ code: "error", Message: "Thiếu thông tin" });
    }

    if (newPassword.length < 8) {
      return res.json({ code: "error", Message: "Mật khẩu phải có ít nhất 8 ký tự" });
    }

    const otpRecord = await OTP.findOne({ email, otp, used: true });
    if (!otpRecord) {
      return res.json({ code: "error", Message: "Vui lòng xác thực OTP trước" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await account_user.updateOne({ email }, { password: hashedPassword });
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ code: "success", Message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server" });
  }
};
