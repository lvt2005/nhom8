import { Request, Response } from "express";
import account_user from "../models/account_user.models";
import bcrypt from "bcrypt"
export const register = async (req: Request, res: Response) => {
  try {
    const accountExists = await account_user.findOne({
      email: req.body.email,
    });
    if (accountExists) {
      res.json({
        code: "error",
        Message: "Email đã tồn tại trong hệ thống!",
      });
      return;
    }
    const accountPhone = await account_user.findOne({
      phone: req.body.phone
    });
    if (accountPhone) {
      res.json({
        code: "error",
        Message: "Số điện thoại đã tồn tại trong hệ thống!",
      });
      return;
    }
    // mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const encryptionPassword = bcrypt.hashSync(req.body.password, salt);
    req.body.password = encryptionPassword;
    const register = new account_user(req.body);
    await register.save();
    res.json({
      code: "success",
      Message: "Đăng ký tài khoản thành công!",
    });
  } catch (error) {
    console.log(error)
    res.json({
      code: "error",
      Message: "lỗi!",
    });
  }
}