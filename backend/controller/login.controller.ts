import { NextFunction, Request, Response } from "express";
import account_user from "../models/account_user.models";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, remember } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.json({
        code: "error",
        Message: "Vui lòng nhập đầy đủ email và mật khẩu!",
      });
    }

    const existEmail = await account_user.findOne({
      email: email.trim().toLowerCase(),
    });
    
    if (!existEmail) {
      return res.json({
        code: "error",
        Message: "Email không tồn tại trong hệ thống!",
      });
    }

    // So sánh mật khẩu
    const existPassword = bcrypt.compareSync(password, `${existEmail.password}`);
    if (!existPassword) {
      return res.json({
        code: "error",
        Message: "Mật khẩu không đúng!",
      });
    }

    // Kiểm tra JWT secret
    if (!process.env.jwtToken) {
      console.error("JWT_SECRET không được cấu hình!");
      return res.json({
        code: "error",
        Message: "Lỗi cấu hình server!",
      });
    }

    // Tạo token
    const token = jwt.sign(
      {
        email: existEmail.email, 
        id: existEmail._id,
      },
      `${process.env.jwtToken}`,
      {
        expiresIn: remember ? "1d" : "3d"
      }
    );

    // Set cookie với đầy đủ options
    res.cookie("token", token, {
      maxAge: remember ? 24 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV == "production" ? true : false,
      path: "/"
    });

    res.json({
      code: "success",
      Message: "Đăng nhập thành công!",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.json({
      code: "error",
      Message: error.message || "Lỗi đăng nhập, vui lòng thử lại!"
    });
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    // Xóa cookie token (luôn xóa dù có token hay không)
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV == "production" ? true : false,
      path: "/"
    });
    
    res.json({
      code: "success",
      Message: "Đăng xuất thành công!",
    });
  } catch (error) {
    // Vẫn xóa cookie ngay cả khi có lỗi
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV == "production" ? true : false,
      path: "/"
    });
    res.json({
      code: "success",
      Message: "Đã đăng xuất!",
    });
  }
}