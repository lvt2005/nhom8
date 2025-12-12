import { NextFunction, Request, Response } from "express";
import account_user from "../models/account_user.models";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password ,remember} = req.body;
    const existEmail = await account_user.findOne({
      email: email,
    });
    if (!existEmail) {
      res.json({
        code: "error",
        Message: "Email không tồn tại trong hệ thống!",
      });
      return;
    }
    const existPassword = bcrypt.compareSync(password, `${existEmail.password}`);
    if (!existPassword) {
      res.json({
        code: "error",
        Message: "Mật khẩu không đúng!",
      });
      return;
    }
    const token = jwt.sign(
      {
        email: existEmail.email, 
        id: existEmail._id,
      },
      `${process.env.jwtToken}`,
      {
        expiresIn: remember ?  "1d" : "3d"
      }
    );
    res.cookie("token", token, {
      maxAge: remember ? 24 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000 ,
      httpOnly: true,
      sameSite: "lax", // Cho phép gửi cookie giữa các domain khác nhau
      secure: process.env.NODE_ENV == "production" ? true : false
    });
    res.json({
      code: "success",
      Message: "Đăng nhập thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      Message: "Dữ liệu không hợp lệ"
    })
  }
}